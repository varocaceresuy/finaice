import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET(req: NextRequest) {
  const symbols = req.nextUrl.searchParams.get("symbols");
  if (!symbols) {
    return NextResponse.json([]);
  }

  const tickers = symbols.split(",").map((s) => s.trim()).filter(Boolean);
  if (tickers.length === 0) return NextResponse.json([]);

  try {
    const quotes = await Promise.all(
      tickers.map(async (ticker) => {
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
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json(quotes.filter(Boolean));
  } catch {
    return NextResponse.json({ error: "Error obteniendo cotizaciones" }, { status: 500 });
  }
}
