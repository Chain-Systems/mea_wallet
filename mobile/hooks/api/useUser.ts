import { apiBaseUrl } from "@/lib/constants";
import { networkRequest } from ".";
import {
  LockUpBalances,
  TokenBalances,
  TokenQuotes,
  TokenType,
} from "@/src/types/balance";
import { BalanceResponseRaw } from "@/src/api/types/balance";
import { trimTrailingZeros } from "@/utils/ui";
import { TwoFADetails, UserDetails } from "@/src/api/types/user";
import { StatusResponse } from "@/src/api/types/auth";
import Decimal from "decimal.js";

export interface DepositSettings {
  minDeposit: Omit<TokenBalances, "usdt_savings">;
  managerDepositAddresses: string[];
  userDepositAddresses: string[];
  tokenDepositAddress: Record<TokenType, string>;
}

export interface WithdrawSettings {
  minWithdraw: TokenBalances;
  withdrawFees: TokenBalances;
}

export interface BalanceResult {
  free: TokenBalances;
  lockup: LockUpBalances;
}

interface UserInfoResponseRaw {
  Thumbnail: string;
  qr_reg: string;
  stakingView: string;
  swapView: string;
}
// ----------------------
// Local Cache for Balance
// ----------------------
let balanceCache: {
  data: BalanceResponseRaw;
  timestamp: number;
} | null = null;

const BALANCE_CACHE_TTL = 1500; // 1.5 seconds

// ----- Binary semaphore lock -----
let balanceCheckLock: Promise<any> | null = null;
let releaseLock: ((value?: unknown) => void) | null = null;

const getCachedBalanceResponse = async (): Promise<
  BalanceResponseRaw | string
> => {
  const now = Date.now();

  // Return cached data instantly
  if (balanceCache && now - balanceCache.timestamp < BALANCE_CACHE_TTL) {
    return balanceCache.data;
  }

  // If another request is already running, wait for it
  if (balanceCheckLock) {
    await balanceCheckLock;
    if (balanceCache) return balanceCache.data;
  }

  // Create binary lock (semaphore)
  balanceCheckLock = new Promise((resolve) => {
    releaseLock = resolve;
  });

  try {
    const raw = await networkRequest<BalanceResponseRaw>(
      `${apiBaseUrl}/api/balance-check`,
      { method: "POST" }
    );

    if (typeof raw === "string") {
      return raw;
    }

    // Cache new data
    balanceCache = {
      data: raw,
      timestamp: Date.now(),
    };

    return raw;
  } finally {
    // Release lock so other waiting calls continue
    releaseLock?.();
    balanceCheckLock = null;
    releaseLock = null;
  }
};

// ----------------------
// Parser
// ----------------------
const parseBalanceResponse = (raw: BalanceResponseRaw) => {
  const balance: BalanceResult = {
    free: {
      mea: trimTrailingZeros(raw.mea_balance),
      mea_gopax : trimTrailingZeros(raw.mea_gopax_balance),
      sol: trimTrailingZeros(raw.sol_balance),
      fox9: trimTrailingZeros(raw.fox9_balance),
      usdt: trimTrailingZeros(raw.usdt_balance),
      usdt_savings: trimTrailingZeros(raw.usdt_temp_balance),
      aon: trimTrailingZeros(raw.aon_balance),
      alton: trimTrailingZeros(raw.alton_balance),
    },
    lockup: {
      mea: trimTrailingZeros(raw.mea_lockup),
      fox9: trimTrailingZeros(raw.fox9_lockup),
    },
  };

  const quotes: TokenQuotes = {
    mea: trimTrailingZeros(raw.mea_quote.toString()),
    sol: trimTrailingZeros(raw.sol_quote.toString()),
    fox9: trimTrailingZeros(raw.fox9_quote.toString()),
    usd: trimTrailingZeros(raw.usd_quote.toString()),
    usdt: trimTrailingZeros(raw.usdt_quote.toString()),
    usdt_savings: trimTrailingZeros(raw.usdt_quote.toString()),
    aon: trimTrailingZeros(raw.aon_quote.toString()),
    alton: trimTrailingZeros(raw.alton_quote.toString()),
    mea_gopax : trimTrailingZeros(raw.mea_gopax_balance.toString()),
  };

  const withdrawSettings: WithdrawSettings = {
    minWithdraw: {
      mea: trimTrailingZeros(raw.mea_min_withdraw_coin),
      fox9: trimTrailingZeros(raw.fox9_min_withdraw_coin),
      sol: trimTrailingZeros(raw.sol_min_withdraw_coin),
      usdt: trimTrailingZeros(raw.usdt_min_withdraw_coin),
      usdt_savings: trimTrailingZeros(raw.usdt_temp_min_withdraw_coin),
      aon: trimTrailingZeros(raw.aon_min_withdraw_coin),
      alton: trimTrailingZeros(raw.alton_min_withdraw_coin),
      mea_gopax : trimTrailingZeros(raw.mea_gopax_balance.toString()),
    },
    withdrawFees: {
      mea: trimTrailingZeros(raw.mea_WithdrawFee),
      fox9: trimTrailingZeros(raw.fox9_WithdrawFee),
      sol: trimTrailingZeros(raw.sol_WithdrawFee),
      usdt: trimTrailingZeros(raw.usdt_WithdrawFee),
      usdt_savings: "0",
      aon: trimTrailingZeros(raw.aon_WithdrawFee),
      alton: trimTrailingZeros(raw.alton_WithdrawFee),
      mea_gopax : trimTrailingZeros(raw.mea_gopax_balance.toString()),
    },
  };

  const swapFee = new Decimal(
    trimTrailingZeros(new Decimal(raw.swap_fee).toFixed(6))
  );

  return { balance, quotes, withdrawSettings, swapFee };
};

export default {
  getAllBalanceData: async () => {
    const raw = await getCachedBalanceResponse();
    if (typeof raw === "string") return raw;
    return parseBalanceResponse(raw);
  },

  getBalance: async () => {
    const raw = await getCachedBalanceResponse();
    if (typeof raw === "string") return raw;
    return parseBalanceResponse(raw).balance;
  },

  getQuotes: async () => {
    const raw = await getCachedBalanceResponse();
    if (typeof raw === "string") return raw;
    return parseBalanceResponse(raw).quotes;
  },

  getWithdrawSettings: async () => {
    const raw = await getCachedBalanceResponse();
    if (typeof raw === "string") return raw;
    return parseBalanceResponse(raw).withdrawSettings;
  },

  getSwapFee: async () => {
    const raw = await getCachedBalanceResponse();
    if (typeof raw === "string") return raw;
    return parseBalanceResponse(raw).swapFee;
  },

  getTwoFAData: async (): Promise<TwoFADetails | string> => {
    const res = await networkRequest<any>(`${apiBaseUrl}/api/user-info`, {
      method: "POST",
    });

    if (typeof res === "string") return res;

    return {
      qrUrl: atob(res.qrUrl),
      secretCode: atob(res.SecretCode),
      isRegistered: res.qr_reg === "Y",
    };
  },
  validate2FABackup: async (otp_code: string) => {
    return await networkRequest<StatusResponse>(`${apiBaseUrl}/api/qr-reg`, {
      method: "POST",
      body: new URLSearchParams({ otp_code }).toString(),
    });
  },
  getUserInfo: async (): Promise<UserDetails | string> => {
    let raw = await networkRequest<UserInfoResponseRaw>(
      `${apiBaseUrl}/api/user-info`,
      {
        method: "POST",
        body: new URLSearchParams({}).toString(),
      }
    );
    if (typeof raw === "string") return raw;
    let data = {
      image: raw.Thumbnail,
      twoFACompleted: raw.qr_reg === "Y",
      swapFeatureEnabled: raw.swapView === "Y",
      stakingFeatureEnabled: raw.swapView === "Y",
    };
    return data;
  },
  updateProfileImage: async (
    image: string
  ): Promise<StatusResponse | string> => {
    return await networkRequest<StatusResponse>(
      `${apiBaseUrl}/api/edit-profile`,
      {
        method: "POST",
        body: new URLSearchParams({ file: image }).toString(),
      }
    );
  },

  updateAvatar: async (emojiCode: string): Promise<StatusResponse | string> => {
    return await networkRequest<StatusResponse>(
      `${apiBaseUrl}/api/edit-avatar`,
      {
        method: "POST",
        body: new URLSearchParams({ file: emojiCode }).toString(),
      }
    );
  },
};