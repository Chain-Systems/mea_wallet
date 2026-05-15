import { apiKey } from "@/lib/constants";
import storage from "@/storage";
import { STORAGE_KEYS } from "@/storage/keys";
import { SupportedSymbol } from "./useChart";
/**
 * Wrapper around fetch
 * Performs fetch request and returns parsed response
 */
let bearerToken: string | null = null;

const fetchAuthToken = async () => {
  if (bearerToken) return;
  const token = await storage.retreive(STORAGE_KEYS.AUTH.TOKEN);
  bearerToken = token;
};

export const resetAuthToken = () => {
  bearerToken = null;
};

//todo : implement concurrency here
const hasHeader = (init: RequestInit, headerName: string): boolean => {
  if (!init.headers) return false;
  // Case 3: headers is a plain object
  return Object.keys(init.headers).some(
    (key) => key.toLowerCase() === headerName.toLowerCase(),
  );
};
/**
 * internal server error ,
 * custom server messages ,
 * network request failures
 */
export const networkRequestWithParser = async <T>(
  input: string | URL | globalThis.Request,
  init?: RequestInit,
): Promise<string | T> => {
  try {
    console.log(input);
    await fetchAuthToken();
    let headers = init?.headers;
    headers = {
      ...headers,
      authorization: "Bearer " + (bearerToken ?? ""),
    };
    const response = await fetch(input, {
      ...init,
      headers: headers,
      // credentials: "same-origin",
    });

    let res = await response.json();
    if (!response.ok) {
      console.log(res.status);
      return res.status as string;
    }
    return res as T;
  } catch (error: any) {
    console.log("Request failed at parser", error);
    if (error.message && typeof error.message === "string") {
      return error.message as string;
    }
    return "";
  }
};

export const networkRequest = async <T>(
  input: string | URL | globalThis.Request,
  init?: RequestInit,
) => {
  //pre request

  if (init && init?.method === "POST") {
    if (init.body && typeof init.body !== "string") {
      return "invalid body type";
    }
    let body = new URLSearchParams(init.body ?? {});
    body.append("apikey", apiKey);
    init.body = body.toString();

    //set default
    if (!hasHeader(init, "Content-Type")) {
      init.headers = {
        ...init.headers,
        "Content-Type": "application/x-www-form-urlencoded",
      };
    }
  }
  return await networkRequestWithParser<T>(input, init);
};

/**
 * Converts lowercase token symbol to uppercase for API endpoints if needed.
 */
export const mapToApiSymbol = (symbol: SupportedSymbol): string => {
  switch (symbol) {
    case "mea":
      return "MEA";
    case "sol":
      return "SOL";
    case "usdt":
      return "USDT";
    case "fox9":
      return "FOX9";
    case "usdt_savings":
      return "USDT Savings";
    // case "aon":
    //   return "AON";
    // case "alton":
    //   return "ALTON";
    // case "mea_gopax":
    //   return "MEA(PAX)";
    default:
      throw new Error(`Unsupported symbol: ${symbol}`);
  }
};
