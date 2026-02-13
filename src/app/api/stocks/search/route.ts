import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const results = await yf.search(query, { newsCount: 0 });
    const stocks = (results.quotes || [])
      .filter(
        (q: Record<string, unknown>) =>
          q.quoteType === "EQUITY" ||
          q.quoteType === "ETF" ||
          q.quoteType === "MUTUALFUND" ||
          q.quoteType === "INDEX" ||
          q.quoteType === "FUTURE" ||
          q.quoteType === "CRYPTOCURRENCY"
      )
      .slice(0, 15)
      .map((q: Record<string, unknown>) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp || q.exchange,
        type: q.quoteType,
      }));

    return NextResponse.json(stocks);
  } catch (e) {
    console.error("Stock search error:", e);
    return NextResponse.json({ error: "Error buscando stocks" }, { status: 500 });
  }
}
