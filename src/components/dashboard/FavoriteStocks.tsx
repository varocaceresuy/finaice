"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Star, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

interface Favorite {
  ticker: string;
  name: string;
}

export function FavoriteStocks() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const favRes = await fetch("/api/stocks/favorites");
      const favs = await favRes.json();
      if (!Array.isArray(favs) || favs.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      setFavorites(favs);

      const symbols = favs.map((f: Favorite) => f.ticker).join(",");
      const quoteRes = await fetch(`/api/stocks/quote?symbols=${symbols}`);
      const data = await quoteRes.json();
      if (Array.isArray(data)) setQuotes(data);
    } catch {
      /* silently fail */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-emerald-400/[0.04] to-transparent backdrop-blur-xl border border-emerald-400/[0.08] rounded-2xl p-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (favorites.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-400/[0.04] to-transparent backdrop-blur-xl border border-emerald-400/[0.08] rounded-2xl overflow-hidden animate-fade-in-up delay-4">
      <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-400/[0.06]">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          Favoritos
        </h3>
        <Link
          href="/dashboard/investments"
          className="text-xs text-emerald-400 hover:opacity-80 font-medium transition-opacity"
        >
          Ver portfolio →
        </Link>
      </div>

      <div className="divide-y divide-emerald-400/[0.04]">
        {favorites.slice(0, 5).map((fav) => {
          const quote = quotes.find((q) => q.symbol === fav.ticker);
          const isUp = (quote?.change ?? 0) >= 0;

          return (
            <div
              key={fav.ticker}
              className="flex items-center gap-3 px-5 py-3 hover:bg-emerald-400/[0.03] transition-all"
            >
              <div
                className={`w-9 h-9 rounded-lg ${
                  isUp ? "bg-emerald-400/[0.08]" : "bg-red-400/[0.08]"
                } flex items-center justify-center text-xs font-bold ${
                  isUp ? "text-emerald-400" : "text-red-400"
                } shrink-0`}
              >
                {fav.ticker.slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium">{fav.ticker}</p>
                <p className="text-xs text-text-muted truncate">{fav.name}</p>
              </div>
              {quote ? (
                <div className="text-right">
                  <p className="text-[13px] font-semibold font-[family-name:var(--font-mono)]">
                    {quote.currency === "USD" ? "$" : quote.currency === "EUR" ? "€" : ""}
                    {quote.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-0.5 text-xs font-medium ${
                      isUp ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {isUp ? "+" : ""}
                    {quote.changePercent.toFixed(2)}%
                  </div>
                </div>
              ) : (
                <span className="text-xs text-text-muted">—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
