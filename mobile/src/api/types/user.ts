export interface TwoFADetails {
  qrUrl: string;
  secretCode: string;
  isRegistered: boolean;
}

export interface UserDetails {
  image: string;
  twoFACompleted: boolean;
  swapFeatureEnabled: boolean;
  stakingFeatureEnabled: boolean;
  kyc_yn?: "Y" | "N";
}
export interface RegistrationResponse {
  status: string;
  message: string;
}
