export interface TokenBalances {
  mea: string;
  mea_gopax: string;
  sol: string;
  fox9: string;
  usdt: string;
  usdt_savings: string;
  aon: string;
  alton: string;
}
export type TokenType = keyof TokenBalances;

export type HoldableTokenBalances = Omit<TokenBalances, "usdt_savings">;

export interface LockUpBalances {
  mea: string;
  fox9: string;
}

export interface TokenQuotes {
  mea: string;
  mea_gopax: string;
  sol: string;
  fox9: string;
  usd: string;
  usdt: string;
  usdt_savings: string;
  aon: string;
  alton: string;
}

export interface ParsedBalance {
  balances: TokenBalances;
  lockups: LockUpBalances;
  quotes: TokenQuotes;
  minDeposit: TokenBalances;
  minWithdraw: TokenBalances;
  withdrawFees: TokenBalances;
  managerDepositAddresses: string[];
  userDepositAddresses: string[];
  swapFee: string;
}
