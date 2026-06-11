import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { apiBaseUrl, apiKey } from "@/lib/constants";
import storage from "@/storage";
import { STORAGE_KEYS } from "@/storage/keys";
import logger from "@/lib/logger";
import {
  KycInfoResponse,
  KycReadySaveResponse,
  KycStartResponse,
  KycPollResponse,
} from "@/src/api/types/kyc";

const log = logger.child({ module: "kycApi" });

const kycBaseQuery: BaseQueryFn<
  { path: string; body?: Record<string, string> },
  unknown,
  string
> = async ({ path, body = {} }) => {
  const url = `${apiBaseUrl}${path}`;

  try {
    const token = await storage.retreive(STORAGE_KEYS.AUTH.TOKEN);

    const params = new URLSearchParams();
    Object.entries({ ...body, apikey: apiKey }).forEach(([k, v]) => params.append(k, v));

    // log after params built; omit apikey from log
    log.debug({ url, body }, "kyc request");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = (data?.status as string) ?? "server_error";
      log.warn({ url, status: response.status, error, payload: data }, "kyc response error");
      return { error };
    }

    if (typeof data === "string") {
      log.warn({ url, error: data }, "kyc server error string");
      return { error: data };
    }

    log.debug({ url, data }, "kyc response ok");
    return { data };
  } catch (e: any) {
    const error = e?.message ?? "network_error";
    log.error({ url, error }, "kyc request failed");
    return { error };
  }
};

export const kycApi = createApi({
  reducerPath: "kycApi",
  baseQuery: kycBaseQuery,
  endpoints: (builder) => ({
    getKycInfo: builder.mutation<KycInfoResponse, void>({
      query: () => ({ path: "/api/app-kyc/info" }),
    }),

    readySave: builder.mutation<
      KycReadySaveResponse,
      { mt_name: string; mt_birth: string }
    >({
      query: (args) => ({
        path: "/api/app-kyc/ready-save",
        body: args,
      }),
    }),

    startKyc: builder.mutation<KycStartResponse, { document_type: string }>({
      query: (args) => ({
        path: "/api/app-kyc/start",
        body: {
          document_type: args.document_type,
          platform: Platform.OS,
          app_callback_uri: "pingwallet://app-kyc-return",
        },
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await storage.save(STORAGE_KEYS.KYC.SESSION_ID, data.session_id);
        } catch {
          // session_id not saved — screen must fall back to deep link param
        }
      },
    }),

    pollKyc: builder.mutation<KycPollResponse, { session_id: string }>({
      query: (args) => ({
        path: "/api/app-kyc/poll",
        body: args,
      }),
    }),
  }),
});

export const {
  useGetKycInfoMutation,
  useReadySaveMutation,
  useStartKycMutation,
  usePollKycMutation,
} = kycApi;
