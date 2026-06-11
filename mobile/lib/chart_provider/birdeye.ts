import { networkRequest } from "@/hooks/api";
import { ChartDataResponse, ChartProvider, Price } from ".";

class BirdEyeProvider implements ChartProvider {
  baseUrl =
    "https://birdeye-proxy.raydium.io/defi/ohlcv/base_quote?base_address=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB&quote_address=FoX9UZETJzXJ2qh6B5g2mBSA9hiWWnLEq1GcHoEEg4fv&type=1D&time_from=1723593600&time_to=1749600000";
  getId(symbol: string) {
    if (symbol === "MEA") {
      return "mecca";
    }
    if (symbol === "SOL") {
      return "solana";
    }
    throw "Invalid Symbol";
  }
  async fetchChartData(
    symbol: string,
    days: string
  ): Promise<ChartDataResponse> {
    let res = await networkRequest<any>(
      this.baseUrl +
        "/coins/" +
        this.getId(symbol) +
        "/market_chart" +
        "?vs_currency=usd&days=" +
        days
    );
    let response = res.prices;

    let prices: Price[] = [];
    for (let item of response) {
      prices.push(item);
    }
    return {
      prices,
    };
  }
}

export default BirdEyeProvider;
