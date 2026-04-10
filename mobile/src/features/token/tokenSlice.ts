import {
  TokenQuotes,
  TokenBalances as TokenThresholds,
} from "@/src/types/balance";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TokenState {
  quotes: TokenQuotes;
  minDeposit: Omit<TokenThresholds, "usdt_savings">;
  withdrawFees: TokenThresholds;
  minWithdraw: TokenThresholds;
  swapFee: string;
}

const initialState: TokenState = {
  quotes: {
    mea: "0",
    sol: "0",
    fox9: "0",
    usd: "0",
    usdt: "0",
    usdt_savings: "0",
    aon: "0",
    alton: "0",
    mea_gopax : "0",
  },
  minDeposit: {
    mea: "0",
    sol: "0",
    fox9: "0",
    usdt: "0",
    aon: "0",
    alton: "0",
    mea_gopax : "0",
  },
  withdrawFees: {
    mea: "0",
    sol: "0",
    fox9: "0",
    usdt: "0",
    usdt_savings: "0",
    aon: "0",
    alton: "0",
    mea_gopax : "0",
  },
  minWithdraw: {
    mea: "0",
    sol: "0",
    fox9: "0",
    usdt: "0",
    usdt_savings: "0",
    aon: "0",
    alton: "0",
    mea_gopax : "0",
  },
  swapFee: "0",
};

const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    setQuotes(state, action: PayloadAction<TokenQuotes>) {
      state.quotes = action.payload;
    },
    setMinDeposit(
      state,
      action: PayloadAction<Omit<TokenThresholds, "usdt_savings">>
    ) {
      state.minDeposit = action.payload;
    },
    setWithdrawFees(state, action: PayloadAction<TokenThresholds>) {
      state.withdrawFees = action.payload;
    },
    setMinWithdraw(state, action: PayloadAction<TokenThresholds>) {
      state.minWithdraw = action.payload;
    },
    setSwapFee(state, action: PayloadAction<string>) {
      state.swapFee = action.payload;
    },
  },
});

export const {
  setQuotes,
  setMinDeposit,
  setWithdrawFees,
  setMinWithdraw,
  setSwapFee,
} = tokenSlice.actions;

export default tokenSlice.reducer;
