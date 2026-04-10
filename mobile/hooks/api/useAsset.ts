import { apiBaseUrl } from "@/lib/constants";
import { mapToApiSymbol, networkRequest } from ".";
import {
  AssetHistoryResponse,
  AssetHistoryResponseRaw,
  SwapPayload,
} from "@/src/api/types/asset";
import { StatusResponse } from "@/src/api/types/auth";
import {
  LockupHistoryResponse,
  LockupHistoryResponseRaw,
} from "@/src/api/types/lockup";
import { TokenQuotes } from "@/src/types/balance";

const url = apiBaseUrl + "/asset";

export interface TransferResponse {
  id: number;
}

export interface WithdrawResponse {
  id: number;
}

export default {
  /**
   * Submit a deposit request
   */
  deposit: async (hash: string, tokenId: number, amount: string) => {
    return await networkRequest<object>(url + "/deposit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hash, tokenId, amount }),
    });
  },

  /**
   * Initiate a withdrawal request
   */
  initiateWithdrawal: async (
    address: string,
    token_id: number,
    amount: string
  ) => {
    return await networkRequest<WithdrawResponse>(url + "/initiate-withdrawl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address, token_id, amount }),
    });
  },

  /**
   * Confirm a withdrawal with OTP
   */
  confirmWithdrawal: async (id: number, otp: string) => {
    return await networkRequest<object>(url + "/confirm-withdrawl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, otp }),
    });
  },

  /**
   * Cancel a withdrawal request
   */
  cancelWithdrawal: async (id: number) => {
    return await networkRequest<object>(url + "/cancel-withdrawl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
  },

  /**
   * Transfer tokens to another user
   */
  transfer: async (
    receiver_username: string,
    token_id: number,
    amount: string
  ) => {
    return await networkRequest<TransferResponse>(url + "/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ receiver_username, token_id, amount }),
    });
  },

  swapTokens: async (payload: SwapPayload) => {
    console.log("swap start ", Date.now());
    const parsedPayload = new URLSearchParams({
      buyCoin: payload.buyCoin, //to symbol
      sel_coin: payload.sellCoin, //from symbol
      fee: payload.platformFeePercent, //fee percentage
      WithdrawFee: payload.adminComission, //admin commission receivable token absolute
      amount: payload.sellAmount, //amount of from token
      payment_coin: payload.expectedReceivableBeforeFee, //expected receivable token before fee
      buy_coin: payload.expectedReceivable, //final receivable to token ( after fee)
      quote: payload.toCurrencyPrice, //to currency price
      quote2: payload.fromCurrencyPrice, //from currency price
      min_deposit_coin: payload.minDepositAmount, //mimumum sell quantity of from token
    }).toString();
    console.log("parsed payload", parsedPayload);
    const raw = await networkRequest<StatusResponse>(
      `${apiBaseUrl}/api/swap-proc`,
      {
        method: "POST",
        body: parsedPayload,
      }
    );
    console.log("swap end ", Date.now());

    if (typeof raw === "string") return raw;
  },

  /**
   * Get lockup history for a token with parsed field names
   */
  getLockupHistory: async (symbol: string, page: number) => {
    const params = new URLSearchParams();
    params.append("symbol", symbol);
    params.append("page", page.toString());

    const raw = await networkRequest<LockupHistoryResponseRaw>(
      `${apiBaseUrl}/api/lockup-history`,
      {
        method: "POST",
        body: params.toString(),
      }
    );

    if (typeof raw === "string") {
      return raw;
    }
    // map raw data to parsed data
    const parsed: LockupHistoryResponse = {
      status: raw.status,
      blockStart: raw.block_start,
      blockEnd: raw.block_end,
      blockNum: raw.block_num,
      totalBlock: raw.total_block,
      items: raw.data.map((item) => ({
        registeredAt: item.regdate,
        amount: item.amount,
        startDate: new Date(item.sdate),
        endDate: new Date(item.edate),
        status: item.state,
      })),
    };
    return parsed;
  },
  getAssetHistory: async (symbol: keyof TokenQuotes, page: number) => {
    const params = new URLSearchParams();
    params.append("symbol", mapToApiSymbol(symbol));
    params.append("page", page.toString());

    const raw = await networkRequest<AssetHistoryResponseRaw>(
      `${apiBaseUrl}/api/history`,
      {
        method: "POST",
        body: params.toString(),
      }
    );

    if (typeof raw === "string") {
      return raw;
    }

    const parsed: AssetHistoryResponse = {
      status: raw.status,
      blockStart: raw.block_start,
      blockEnd: raw.block_end,
      blockNum: raw.block_num,
      totalBlock: raw.total_block,
      items: raw.data.map((item) => ({
        registeredAt: item.regdate,
        type: item.gubn,
        amount: item.amount,
        withdrawFee: item.WithdrawFee,
        previousBalance: item.prev_amount,
        nextBalance: item.next_amount,
        status: item.state,
        fromAddress: item.from_address,
        toAddress: item.to_address,
        txHash: item.hash,
        memo: item.memo,
        seqno : item.no
      })),
    };

    return parsed;
  },
  autoCloseLockUp: async (symbol: string) => {
    return await networkRequest<StatusResponse>(
      `${apiBaseUrl}/api/lockup-proc`,
      {
        method: "POST",
        body: new URLSearchParams({ symbol }).toString(),
      }
    );
  },
};
