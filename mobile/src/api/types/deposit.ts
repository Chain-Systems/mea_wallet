import { TokenQuotes } from "@/src/types/balance";

export interface DepositRecord {
  id: string;
  token: string;
  amount: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface InitiateDepositPayload {
  symbol: keyof TokenQuotes;
  manager_deposit_address: string;
  min_deposit_coin: string;
  amount: string;
  txid: string;
  wallet_address: string;
}

export interface DepositAddressResponse {
  managerAddresses: string[];
  userAddresses: string[];
}
export interface WalletAddressResponse {
  status: string;
  deposit_address: string | null;
  deposit_address_2: string | null;
  deposit_address_3: string | null;
  deposit_address_4: string | null;
  deposit_address_5: string | null;
}
