import { apiBaseUrl } from "@/lib/constants";
import { networkRequest } from ".";

import {
  StatusResponse,
  LoginStatusResponse,
  LogoutResponse,
  ForgetPasswordResponse,
  AuthResponse,
  GoogleSignUpResponse,
  GoogleLogInResponse,
  UnlockSendResponse,
  UnlockConfirmResponse,
} from "@/src/api/types/auth";

export default {
  login: async (email: string, password: string) => {
    return await networkRequest<AuthResponse>(`${apiBaseUrl}/api/login-check`, {
      method: "POST",
      body: new URLSearchParams({
        UserEmail: email,
        UserPwd: password,
      }).toString(),
    });
  },

  signUp: async (email: string, password: string, depositAddress: string) => {
    return await networkRequest<StatusResponse>(`${apiBaseUrl}/api/join-save`, {
      method: "POST",
      body: new URLSearchParams({
        UserEmail: email,
        UserPwd: password,
        deposit_address: depositAddress,
      }).toString(),
    });
  },

  signUpWithGoogle: async (
    token: string,
    deposit_address: string,
    device: "ios" | "android"
  ) => {
    return await networkRequest<GoogleSignUpResponse>(
      `${apiBaseUrl}/api/join-save-google`,
      {
        method: "POST",
        body: new URLSearchParams({
          id_token: token,
          deposit_address: deposit_address,
          device: '',
        }).toString(),
      }
    );
  },

  signInWithGoogle: async (token: string, device: "ios" | "android") => {
    return await networkRequest<GoogleLogInResponse>(
      `${apiBaseUrl}/api/login-google`,
      {
        method: "POST",
        body: new URLSearchParams({
          id_token: token,
          device: '',
        }).toString(),
      }
    );
  },

  isEmailAvailable: async (email: string) => {
    return await networkRequest<StatusResponse>(`${apiBaseUrl}/api/id-check`, {
      method: "POST",
      body: new URLSearchParams({
        UserEmail: email,
      }).toString(),
    });
  },

  forgetPassword: async (email: string, otp: string) => {
    return await networkRequest<ForgetPasswordResponse>(
      `${apiBaseUrl}/api/find-password`,
      {
        method: "POST",
        body: new URLSearchParams({
          UserEmail: email,
          otp_code: otp,
        }).toString(),
      }
    );
  },

  changePassword: async (
    prevPassword: string,
    newPassword: string,
    otpCode: string
  ) => {
    return await networkRequest<StatusResponse>(
      `${apiBaseUrl}/api/password-save`,
      {
        method: "POST",
        body: new URLSearchParams({
          PrevUserPwd: prevPassword,
          UserPwd: newPassword,
          otp_code: otpCode,
        }).toString(),
      }
    );
  },

  register2FA: async (otpCode: string) => {
    return await networkRequest<StatusResponse>(`${apiBaseUrl}/api/qr-reg`, {
      method: "POST",
      body: new URLSearchParams({
        otp_code: otpCode,
      }).toString(),
    });
  },

  loginStatus: async (): Promise<LoginStatusResponse | string> => {
    let raw = await networkRequest<LoginStatusResponse>(
      `${apiBaseUrl}/api/login-status`
    );
    if (typeof raw === "string") return raw;
    return {
      loggedIn: raw.loggedIn,
      UserEmail: atob(raw.UserEmail),
    };
  },

  logout: async () => {
    return await networkRequest<LogoutResponse>(`${apiBaseUrl}/api/logout`, {
      method: "POST",
    });
  },

  sendUnlockCode: async (email: string) => {
    return await networkRequest<UnlockSendResponse>(
      `${apiBaseUrl}/api/login-unlock-email-verification-send`,
      {
        method: "POST",
        body: new URLSearchParams({
          UserEmail: email,
          Country: "CN",
        }).toString(),
      }
    );
  },

  confirmUnlock: async (email: string, country: string, otp_code: string) => {
    return await networkRequest<UnlockConfirmResponse>(
      `${apiBaseUrl}/api/login-unlock-confirm`,
      {
        method: "POST",
        body: new URLSearchParams({
          UserEmail: email,
          Country: country,
          otp_code,
        }).toString(),
      }
    );
  },
};
