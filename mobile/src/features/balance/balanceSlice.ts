import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { LockUpBalances, TokenBalances } from "@/src/types/balance";

interface BalanceState {
  free: TokenBalances;
  lockup: LockUpBalances; // `sol` has no lockup
}

const initialState: BalanceState = {
  free: {
    mea: "0",
    // mea_gopax : '0',
    sol: "0",
    fox9: "0",
    usdt: "0",
    usdt_savings: "0",
  },
  lockup: { mea: "0", fox9: "0"   },
};

const balanceSlice = createSlice({
  name: "balance",
  initialState,
  reducers: {
    setFreeBalances(state, action: PayloadAction<TokenBalances>) {
      state.free = action.payload;
    },
    setLockupBalances(state, action: PayloadAction<LockUpBalances>) {
      state.lockup = action.payload;
    },
  },
});

export const { setFreeBalances, setLockupBalances } = balanceSlice.actions;
export default balanceSlice.reducer;
