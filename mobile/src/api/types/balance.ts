export interface BalanceResponseRaw {
  status: string;
  mea_balance: string;
  // mea_gopax_balance : string;
  sol_balance: string;
  recon_balance: string;
  fox9_balance: string;
  usdt_balance: string;
  usdt_temp_balance: string;
  // aon_balance: string;
  // alton_balance: string;

  mea_lockup: string;
  recon_lockup: string;
  fox9_lockup: string;
  // mea_gopax_lockup:string;

  mea_quote: string;
  sol_quote: string;
  fox9_quote: string;
  usd_quote: string;
  usdt_quote: string;
  recon_quote: string;
  // aon_quote: string;
  // alton_quote: string;
  // mea_gopax_quote: string;

  mea_min_deposit_coin: string;
  recon_min_deposit_coin: string;
  fox9_min_deposit_coin: string;
  sol_min_deposit_coin: string;
  usdt_min_deposit_coin: string;
  // aon_min_deposit_coin: string;
  // alton_min_deposit_coin: string;
  // mea_gopax_min_deposit_coin:string;

  mea_min_withdraw_coin: string;
  recon_min_withdraw_coin: string;
  fox9_min_withdraw_coin: string;
  sol_min_withdraw_coin: string;
  usdt_min_withdraw_coin: string;
  usdt_temp_min_withdraw_coin: string;
  // aon_min_withdraw_coin: string;
  // alton_min_withdraw_coin: string;
  // mea_gopax_min_withdraw_coin:string;

  mea_WithdrawFee: string;
  recon_WithdrawFee: string;
  fox9_WithdrawFee: string;
  sol_WithdrawFee: string;
  usdt_WithdrawFee: string;
  // aon_WithdrawFee: string;
  // alton_WithdrawFee: string;
  // mea_gopax_WithdrawFee:string;

  manager_deposit_address: string;
  manager_deposit_address_2: string;
  manager_deposit_address_3: string;
  manager_deposit_address_4: string;
  manager_deposit_address_5: string;
  manager_deposit_address_6: string;
  // manager_deposit_address_aon: string;
  // manager_deposit_address_alton: string;

  deposit_address: string;
  deposit_address_2: string | null;
  deposit_address_3: string | null;
  deposit_address_4: string | null;
  deposit_address_5: string | null;

  swap_fee: number;
}
