export type KycPollStatus =
  | "succ"
  | "pending"
  | "mismatch_name"
  | "mismatch_birth"
  | "kyc_status_not_approved"
  | "cooldown_active"
  | "kyc_no_credits"
  | "kyc_provider_error"
  | "server_error";

export interface KycInfoResponse {
  kyc_yn: "Y" | "N";
  mt_name_set: boolean;
  mt_birth_set: boolean;
  mt_name: string;
  mt_birth: string;
}

export interface KycReadySaveResponse {
  status: string;
}

export interface KycStartResponse {
  session_id: string;
  session_url: string;
  bridge_id: string;
  poll_path: string;
  return_path: string;
  platform: string;
}

export interface KycPollResponse {
  status: KycPollStatus;
  kyc_yn: "Y" | "N";
  retry_after_sec?: number;
}
