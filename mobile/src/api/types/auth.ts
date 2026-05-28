// api/types/auth.ts

export interface StatusResponse {
  status: "succ" | string;
}

export interface AuthResponse {
  status: "succ" | string;
  token: string;
}

export interface GoogleSignUpResponse extends AuthResponse {
  status: "succ" | "need_link" | "already_signup" | "need_deposit_address";
  token: string;
}

export interface GoogleLogInResponse extends AuthResponse {
  status: "succ" | "need_signup" | "need_link";
  token: string;
}

export interface CsrfTokenResponse {
  csrfToken: string;
}

export interface LoginStatusResponse {
  loggedIn: boolean;
  UserEmail: string;
}

export interface LogoutResponse {
  logout: string;
}

export interface ForgetPasswordResponse {
  status: "Temporary password" | string;
  TemporaryPassword: string;
}

export interface UnlockSendResponse {
  status: string;
  expires_in?: number;
  message?: string;
}

export interface UnlockConfirmResponse {
  status: string;
  message?: string;
}
