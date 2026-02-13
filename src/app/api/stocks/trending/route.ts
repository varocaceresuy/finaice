import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Stocks populares por categoría
const POPULAR_TICKERS = [
  // Índices principales
  "^GSPC", "^DJI", "^IXIC", "^FTSE", "^N225",
  // Tech
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA",
  // ETFs
  "SPY", "QQQ", "VOO", "VTI",
  // Finanzas
  "JPM", "V", "MA",
  // Salud
  "JNJ", "UNH",
  // Crypto-related
  "COIN", "BTC-USD", "ETH-USD",
  // Europa
  "ASML", "SAP",
  // Energía
  "XOM",
];

export async function GET() {
  try {
    const quotes = await Promise.all(
      POPULAR_TICKERS.map(async (ticker) => {
        try {
          const q = await yf.quote(ticker);
          return {
            symbol: q.symbol,
            name: q.shortName || q.longName || q.symbol,
            price: q.regularMarketPrice ?? 0,
            change: q.regularMarketChange ?? 0,
            changePercent: q.regularMarketChangePercent ?? 0,
            currency: q.currency || "USD",
            marketState: q.marketState || "CLOSED",
            exchange: q.fullExchangeName || q.exchange,
            marketCap: q.marketCap ?? 0,
          };
        } catch (e) {
          console.error(`Error fetching ${ticker}:`, e);
          return null;
        }
      })
    );

    const valid = quotes.filter(Boolean);
    console.log(`Trending: ${valid.length}/${POPULAR_TICKERS.length} stocks fetched`);
    return NextResponse.json(valid);
  } catch (e) {
    console.error("Trending error:", e);
    return NextResponse.json({ error: "Error obteniendo datos" }, { status: 500 });
  }
}
