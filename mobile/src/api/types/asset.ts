import { TokenType } from "@/src/types/balance";

export interface SwapPayload {
  buyCoin: TokenType; // Coin to buy (e.g. MEA)
  sellCoin: TokenType; // Coin to sell (e.g. RECON)
  platformFeePercent: string; // Platform fee as percent
  adminComission: string; // Withdrawal fee in sell coin
  sellAmount: string; // Amount user is selling
  expectedReceivableBeforeFee: string; // Calculated payment value in sell coin
  expectedReceivable: string; // Calculated amount user will receive (buy coin)
  fromCurrencyPrice: string; // Current price of sell coin
  toCurrencyPrice: string; // Current price of buy coin
  minDepositAmount: string; // Minimum deposit allowed
}

export interface SwapResponseRaw {
  status: string;
  from_token_balance: string;
  to_token_balance: string;
  swap_fee: string;
}

export interface SwapResult {
  success: boolean;
  fromTokenBalance: string;
  toTokenBalance: string;
  swapFee: string;
}

export interface AssetHistoryResponseRaw {
  status: string;
  block_start: number;
  block_end: number;
  block_num: number;
  total_block: number;
  data: AssetHistoryItemRaw[];
}

export interface AssetHistoryItemRaw {
  regdate: string;
  gubn: string;
  amount: string;
  WithdrawFee: string;
  prev_amount: string;
  next_amount: string;
  state: string;
  from_address: string;
  to_address: string;
  hash: string;
  memo: string;
  no : number;
}

export interface AssetHistoryResponse {
  status: string;
  blockStart: number;
  blockEnd: number;
  blockNum: number;
  totalBlock: number;
  items: AssetHistoryItem[];
}

export interface AssetHistoryItem {
  registeredAt: string; // regdate
  type: string; // gubn
  amount: string;
  withdrawFee: string;
  previousBalance: string;
  nextBalance: string;
  status: string;
  fromAddress: string;
  toAddress: string;
  txHash: string;
  memo: string;
  seqno : number;
}
