import { TokenType } from "@/src/types/balance";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface DepositState {
  depositAddresses: string[];
  registeredAddresses: string[];
  tokenDepositAddress: Record<TokenType, string>;
  loading: boolean;
  error: string | null;
}

const initialState: DepositState = {
  depositAddresses: [
  ],
  tokenDepositAddress: {
    fox9: "meo9SCFkSiViD3qKvnY2fmGuW3Vi4PNhDKtswwTPVvbo",
    mea: "meo9SCkSiViD3qKvnY2fmGuW3Vi4PNhDKtswwTPVvbo",
    sol: "meo9SCkSiViD3qKvnY2fmGuW3Vi4PNhDKtswwTPVvbo",
    usdt: "meo9SCkSiViD3qKvnY2fmGuW3Vi4PNhDKtswwTPVvbo",
    usdt_savings: "meo9SCkSiViD3qKvnY2fmGuW3Vi4PNhDKtswwTPVvbo",
    mea_gopax: "meo9SCkSiViD3qKvnY2fmGuW3Vi4PNhDKtswwTPVvbo"
  },
  registeredAddresses: [],
  loading: false,
  error: null,
};

const depositSlice = createSlice({
  name: "deposit",
  initialState,
  reducers: {
    setDepositAddresses(state, action: PayloadAction<string[]>) {
      state.depositAddresses = action.payload;
      state.loading = false;
      state.error = null;
    },
    setTokenDepositAddress(
      state,
      action: PayloadAction<Record<TokenType, string>>
    ) {
      state.tokenDepositAddress = action.payload;
    },
    setRegisteredAddresses(state, action: PayloadAction<string[]>) {
      state.registeredAddresses = action.payload;
    },
    setDepositLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setDepositError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearDepositData(state) {
      state.depositAddresses = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setDepositAddresses,
  setDepositLoading,
  setDepositError,
  clearDepositData,
  setRegisteredAddresses,
  setTokenDepositAddress,
} = depositSlice.actions;

export default depositSlice.reducer;
