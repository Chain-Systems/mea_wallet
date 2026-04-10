import { apiBaseUrl } from "@/lib/constants";
import { mapToApiSymbol, networkRequest } from ".";
import { GraphPoint } from "react-native-graph";
import { TokenMetricsResponse, TokenOverview } from "@/src/api/types/chart";
import { TokenQuotes } from "@/src/types/balance";

export type SupportedSymbol = keyof TokenQuotes; // added fox9
export type SupportedPeriod =
  | "1day"
  | "1hour"
  | "1week"
  | "1month"
  | "ytd"
  | "all";

/**
 * Maps frontend periods to API period values if different.
 */
const periodMap: Record<SupportedPeriod, string> = {
  "1day": "1Day",
  "1hour": "1Hour",
  "1week": "1Week",
  "1month": "1Month",
  ytd: "YTD",
  all: "All",
};

async function getChartData(
  symbol: SupportedSymbol,
  period: SupportedPeriod
): Promise<GraphPoint[] | string> {
  try {
    const apiSymbol = mapToApiSymbol(symbol);
    const apiPeriod = periodMap[period];

    if (["MEA", "MEA(PAX)"].includes(apiSymbol)) {
      const params = new URLSearchParams();
      params.append("gubn", apiPeriod);

      const raw = await networkRequest<any>(`${apiBaseUrl}/api/bingx/chart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (typeof raw === "string") return raw;
      if (!raw.data) return [];

      return raw.data.map((item: any[]) => ({
        date: new Date(item[0]),
        value: parseFloat(item[4]),
      }));
    }

    if (apiSymbol === "SOL") {
      const params = new URLSearchParams();
      params.append("gubn", apiPeriod);

      const raw = await networkRequest<any>(`${apiBaseUrl}/api/sol/chart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (typeof raw === "string") return raw;
      if (!raw.data) return [];

      return raw.data.map((item: any) => ({
        date: new Date(item.ts),
        value: parseFloat(item.close),
      }));
    }

    if (apiSymbol === "RECON") {
      const params = new URLSearchParams();
      params.append("pair", "RECONUSDT");
      params.append("tm", apiPeriod);

      const raw = await networkRequest<any>(
        `${apiBaseUrl}/api/recon/chart-data?${params.toString()}`,
        {
          method: "GET",
        }
      );

      if (typeof raw === "string") return raw;
      if (!raw.data || !raw.data.item) return [];

      return raw.data.item.map((item: any) => ({
        date: new Date(item.startTime * 1000),
        value: parseFloat(item.close),
      }));
    }

    if (apiSymbol === "FOX9") {
      const params = new URLSearchParams();
      params.append("gubn", apiPeriod);

      const raw = await networkRequest<any>(
        `${apiBaseUrl}/api/fox9/chart?${params.toString()}`,
        {
          method: "GET",
        }
      );

      if (typeof raw === "string") return raw;
      if (!raw.data) return [];

      return raw.data.map((item: any) => ({
        date: new Date(item.time * 1000), // converting epoch seconds to JS Date
        value: parseFloat(item.price),
      }));
    }

    if (apiSymbol === "USDT" || apiSymbol === "USDT Savings") {
      const params = new URLSearchParams();
      params.append("gubn", apiPeriod);

      const raw = await networkRequest<any>(
        `${apiBaseUrl}/api/usdt/chart?${params.toString()}`,
        {
          method: "GET",
        }
      );

      if (typeof raw === "string") return raw;
      if (!raw.data) return [];

      return raw.data.map((item: any) => ({
        date: new Date(item.time * 1000), // converting epoch seconds to JS Date
        value: parseFloat(item.price),
      }));
    }

    if (apiSymbol === "AON" || apiSymbol === "ALTON") {
      const params = new URLSearchParams();
      params.append("gubn", apiPeriod);
      params.append("token", apiSymbol.toLowerCase());

      const raw = await networkRequest<any>(
        `${apiBaseUrl}/api/token/chartData?${params.toString()}`,
        {
          method: "GET",
        }
      );

      if (typeof raw === "string") return raw;
      if (!raw.data) return [];

      return raw.data.map((item: any) => ({
        date: new Date(item.time * 1000), // converting epoch seconds to JS Date
        value: parseFloat(item.price),
      }));
    }

    throw new Error(`Unsupported symbol: ${symbol}`);
  } catch (error) {
    console.error("getChartData error:", error);
    return "Failed to load chart data.";
  }
}
async function getTokenMetrics(
  symbol: SupportedSymbol
): Promise<TokenMetricsResponse | string> {
  try {
    const apiSymbol = mapToApiSymbol(symbol);

    const raw = await networkRequest<TokenMetricsResponse>(
      `${apiBaseUrl}/api/balance-rate-of-change`,
      {
        method: "POST",
        body: new URLSearchParams({
          asset: apiSymbol,
        }).toString(),
      }
    );

    return raw;
  } catch (error) {
    console.error("getTokenOverview error:", error);
    return "Failed to load token overview.";
  }
}

async function getTokenOverview(
  symbol: SupportedSymbol
): Promise<TokenOverview | string> {
  try {
    const apiSymbol = mapToApiSymbol(symbol);

    if (apiSymbol === "RECON") {
      const raw = await networkRequest<any>(
        `${apiBaseUrl}/api/recon/quote-data`,
        {
          method: "GET",
        }
      );

      if (typeof raw === "string") return raw;

      return {
        symbol: "RECON",
        price: parseFloat(raw.close),
        volume: parseFloat(raw.volume),
      };
    }

    if (["MEA", "MEA(PAX)"].includes(apiSymbol)) {
      const raw = await networkRequest<any>(`${apiBaseUrl}/api/bingx/price`, {
        method: "GET",
      });

      if (typeof raw === "string") return raw;
      if (!raw.data || raw.data.length === 0) return "No data for MEA.";

      const data = raw.data[0];

      return {
        symbol: "MEA",
        price: parseFloat(data.lastPrice),
        volume: parseFloat(data.volume),
      };
    }

    if (apiSymbol === "SOL") {
      const raw = await networkRequest<any>(`${apiBaseUrl}/api/sol/price`, {
        method: "GET",
      });

      if (typeof raw === "string") return raw;

      return {
        symbol: "SOL",
        price: parseFloat(raw.lastPrice),
        volume: parseFloat(raw.volume),
      };
    }

    if (apiSymbol === "USDT" || apiSymbol === "USDT Savings") {
      const raw = await networkRequest<any>(
        `${apiBaseUrl}/api/usdt/quote-data`,
        {
          method: "GET",
        }
      );

      if (typeof raw === "string") return raw;

      return {
        symbol: apiSymbol === "USDT" ? "USDT" : "usdt_savings",
        price: parseFloat(raw.usdPrice),
        volume: 0,
      };
    }

    if (apiSymbol === "AON" || apiSymbol === "ALTON") {
      const raw = await networkRequest<any>(
        `${apiBaseUrl}/api/${apiSymbol.toLowerCase()}/price`,
        {
          method: "GET",
        }
      );
      if (typeof raw === "string") return raw;

      return {
        symbol: apiSymbol,
        price: parseFloat(raw),
        volume: 0,
      };
    }

    // Placeholder for FOX9 token overview if needed in future
    if (apiSymbol === "FOX9") {
      return {
        symbol: "FOX9",
        price: 0,
        volume: 0,
      };
    }

    throw new Error(`Unsupported symbol: ${symbol}`);
  } catch (error) {
    console.error("getTokenOverview error:", error);
    return "Failed to load token overview.";
  }
}

export default {
  getChartData,
  getTokenOverview,
  getTokenMetrics,
};
