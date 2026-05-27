import { apiBaseUrl } from "@/lib/constants";
import { networkRequest } from ".";
import {
  KycInfoResponse,
  KycReadySaveResponse,
  KycStartResponse,
  KycPollResponse,
} from "@/src/api/types/kyc";
import storage from "@/storage";
import { STORAGE_KEYS } from "@/storage/keys";
import { Platform } from "react-native";

export default {
  getKycInfo: async (): Promise<KycInfoResponse | string> => {
    return await networkRequest<KycInfoResponse>(
      `${apiBaseUrl}/api/app-kyc/info`,
      { method: "POST" }
    );
  },

  readySave: async (
    mt_name: string,
    mt_birth: string
  ): Promise<KycReadySaveResponse | string> => {
    return await networkRequest<KycReadySaveResponse>(
      `${apiBaseUrl}/api/app-kyc/ready-save`,
      {
        method: "POST",
        body: new URLSearchParams({ mt_name, mt_birth }).toString(),
      }
    );
  },

  startKyc: async (
    document_type: string
  ): Promise<KycStartResponse | string> => {
    const res = await networkRequest<KycStartResponse>(
      `${apiBaseUrl}/api/app-kyc/start`,
      {
        method: "POST",
        body: new URLSearchParams({
          document_type,
          platform: Platform.OS,
          app_callback_uri: "pingwallet://app-kyc-return",
        }).toString(),
      }
    );
    if (typeof res !== "string" && res.session_id) {
      await storage.save(STORAGE_KEYS.KYC.SESSION_ID, res.session_id);
    }
    return res;
  },

  pollKyc: async (session_id: string): Promise<KycPollResponse | string> => {
    return await networkRequest<KycPollResponse>(
      `${apiBaseUrl}/api/app-kyc/poll`,
      {
        method: "POST",
        body: new URLSearchParams({ session_id }).toString(),
      }
    );
  },
};
