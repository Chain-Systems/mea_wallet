export enum StakingState {
  IN_PROGRESS = "proceeding",
  CLOSED = "unstaking",
}
export interface UserStakingResponse {
  status: string;
  block_start: number;
  block_end: number;
  block_num: number;
  total_block: number;
  data: RawUserStaking[];
}

export interface RawUserStaking {
  seqno: number;
  symbol: string;
  regdate: string;
  goods_name: string;
  expected_withdrawal_date: string;
  money: string; // deposit amount
  usdt: string;
  krw: string;
  interest_rate: string;
  interest: string;
  unstaking_fee: string;
  withdrawal_date: string; // lockup days
  maturity_state: string;
  expected_withdrawal: string; // final expected amount
  lockup_date: string;
  stateStr: string;
  state: string;
}

export interface UserStaking {
  id: number;
  tokenSymbol: string;
  registeredAt: Date;
  planName: string;
  expectedWithdrawalDate: Date;
  depositAmount: string;
  usdtValue: string;
  krwValue: string;
  interestRate: string;
  interestAtMaturity: string;
  unstakingFee: string;
  lockupDays: string;
  maturityState: string;
  expectedFinalAmount: string;
  lockupDate: string;
  stateStr: string;
  state: string;
}

export interface StakingHistoryItem {
  id: number;
  token: string;
  date: string; // ISO string, parsed to localised string if needed in component
  previousBalance: string;
  amount: string;
  newBalance: string;
  note: string;
  state: string;
}

export interface StakingHistoryApiItem {
  seqno: number;
  target: string;
  regdate: string;
  prev_money: string;
  gubn: string;
  maturity_state: string;
  money: string;
  next_money: string;
  memo: string;
}

export interface StakingHistoryApiResponse {
  status: string;
  block_start: number;
  block_end: number;
  block_num: number;
  total_block: number;
  data: StakingHistoryApiItem[];
}

export interface RawStakingConfig {
  isStaking: boolean;
  stakingState: boolean;
}

export interface StakingConfig {
  stakingDisabled: boolean;
  //disable for all users
  strict: boolean;
}
