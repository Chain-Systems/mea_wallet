export class StakingPlan {
  id: number;
  registeredAt: string;
  imageUrl: string;
  name: string;
  lockupDays: number;
  interestRate: string;
  unstakingFee: string;
  minDeposit: string;
  totalDeposited: string;
  state: string;
  supportedTokens: string[];

  constructor(data: any) {
    this.id = data.id;
    this.registeredAt = data.registeredAt ?? data.registered_at ?? "";
    this.imageUrl = data.imageUrl ?? data.image_url ?? "";
    this.name = data.name ?? "";
    this.lockupDays = data.lockupDays ?? data.lockup_days ?? 0;
    this.interestRate = data.interestRate ?? data.interest_rate ?? "0";
    this.unstakingFee = data.unstakingFee ?? data.unstaking_fee ?? "0";
    this.minDeposit = data.minDeposit ?? data.min_deposit ?? "0";
    this.totalDeposited = data.totalDeposited ?? data.total_deposited ?? "0";
    this.state = data.state ?? "";
    this.supportedTokens = data.supportedTokens ?? data.supported_tokens ?? [];
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      registeredAt: this.registeredAt,
      imageUrl: this.imageUrl,
      name: this.name,
      lockupDays: this.lockupDays,
      interestRate: this.interestRate,
      unstakingFee: this.unstakingFee,
      minDeposit: this.minDeposit,
      totalDeposited: this.totalDeposited,
      state: this.state,
      supportedTokens: this.supportedTokens,
    };
  }
}
