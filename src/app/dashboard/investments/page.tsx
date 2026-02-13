"use client";

import { Header } from "@/components/layout/Header";
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Loader2,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

interface StockResult {
  symbol: string;
  name: string;
  exchange?: string;
  type?: string;
}

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
  exchange?: string;
  marketCap?: number;
}

interface FavoriteStock {
  id: string;
  ticker: string;
  name: string;
  exchange?: string | null;
}

const REFRESH_INTERVAL = 15_000; // 15 segundos

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `${(cap / 1e6).toFixed(0)}M`;
  return cap.toLocaleString();
}

function formatPrice(price: number, currency: string): string {
  const symbol =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "";
  return `${symbol}${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function InvestmentsPage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StockResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteStock[]>([]);
  const [favQuotes, setFavQuotes] = useState<Record<string, StockQuote>>({});
  const [allStocks, setAllStocks] = useState<StockQuote[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // El cierre del dropdown se maneja con el overlay fixed

  // Cargar favoritos
  useEffect(() => {
    fetch("/api/stocks/favorites")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFavorites(data);
      })
      .catch(() => {});
  }, []);

  // Cargar cotizaciones para favoritos que no están en trending
  const loadFavQuotes = useCallback(
    async (favs: FavoriteStock[], trendingStocks: StockQuote[]) => {
      const trendingSymbols = new Set(trendingStocks.map((s) => s.symbol));
      const missingTickers = favs
        .map((f) => f.ticker)
        .filter((t) => !trendingSymbols.has(t));

      if (missingTickers.length === 0) return;

      try {
        const res = await fetch(
          `/api/stocks/quote?symbols=${encodeURIComponent(missingTickers.join(","))}`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const map: Record<string, StockQuote> = {};
          data.forEach((q: StockQuote) => {
            map[q.symbol] = q;
          });
          setFavQuotes((prev) => ({ ...prev, ...map }));
        }
      } catch {
        /* silently fail */
      }
    },
    []
  );

  // Cargar stocks populares
  const loadStocks = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoadingStocks(true);

      try {
        const res = await fetch("/api/stocks/trending");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllStocks(data);
          setLastUpdate(new Date());
          // Cargar cotizaciones de favoritos que faltan
          loadFavQuotes(favorites, data);
        }
      } catch {
        /* silently fail */
      }
      setLoadingStocks(false);
      setRefreshing(false);
    },
    [favorites, loadFavQuotes]
  );

  // Carga inicial
  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  // Auto-refresh en vivo
  useEffect(() => {
    if (!liveEnabled) return;
    const interval = setInterval(() => {
      loadStocks(true);
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [liveEnabled, loadStocks]);

  // Cargar cotizaciones de favoritos cuando cambian
  useEffect(() => {
    if (favorites.length > 0 && allStocks.length > 0) {
      loadFavQuotes(favorites, allStocks);
    }
  }, [favorites, allStocks, loadFavQuotes]);

  // Obtener cotización de un ticker (trending o favQuotes)
  const getQuote = (ticker: string): StockQuote | undefined => {
    return allStocks.find((q) => q.symbol === ticker) || favQuotes[ticker];
  };

  // Búsqueda con debounce
  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setShowDropdown(true);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        if (Array.isArray(data)) setSearchResults(data);
      } catch {
        /* silently fail */
      }
      setSearching(false);
    }, 300);
  };

  const isFavorite = (symbol: string) => favorites.some((f) => f.ticker === symbol);

  const toggleFavorite = async (symbol: string, name: string, exchange?: string) => {
    if (isFavorite(symbol)) {
      // Optimistic: quitar de UI
      const prevFavs = [...favorites];
      setFavorites((prev) => prev.filter((f) => f.ticker !== symbol));
      setFavQuotes((prev) => {
        const next = { ...prev };
        delete next[symbol];
        return next;
      });
      try {
        const res = await fetch("/api/stocks/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker: symbol }),
        });
        if (!res.ok) throw new Error("DELETE failed");
      } catch {
        // Revertir si falla
        setFavorites(prevFavs);
        console.error("Error eliminando favorito", symbol);
      }
    } else {
      const newFav: FavoriteStock = {
        id: crypto.randomUUID(),
        ticker: symbol,
        name,
        exchange,
      };
      // Optimistic: añadir a UI
      const prevFavs = [...favorites];
      setFavorites((prev) => [newFav, ...prev]);
      try {
        const res = await fetch("/api/stocks/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker: symbol, name, exchange }),
        });
        if (!res.ok) throw new Error("POST failed");
        // Obtener cotización inmediata
        const quoteRes = await fetch(`/api/stocks/quote?symbols=${encodeURIComponent(symbol)}`);
        const data = await quoteRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setFavQuotes((prev) => ({ ...prev, [symbol]: data[0] }));
        }
      } catch {
        // Revertir si falla
        setFavorites(prevFavs);
        console.error("Error guardando favorito", symbol);
      }
    }
  };

  const removeFavorite = async (ticker: string) => {
    const prevFavs = [...favorites];
    setFavorites((prev) => prev.filter((f) => f.ticker !== ticker));
    setFavQuotes((prev) => {
      const next = { ...prev };
      delete next[ticker];
      return next;
    });
    try {
      const res = await fetch("/api/stocks/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      if (!res.ok) throw new Error("DELETE failed");
    } catch {
      // Revertir si falla
      setFavorites(prevFavs);
      console.error("Error eliminando favorito", ticker);
    }
  };

  // Stocks filtrados: favoritos primero
  const sortedStocks = [...allStocks].sort((a, b) => {
    const aFav = isFavorite(a.symbol) ? 0 : 1;
    const bFav = isFavorite(b.symbol) ? 0 : 1;
    if (aFav !== bFav) return aFav - bFav;
    return (b.marketCap ?? 0) - (a.marketCap ?? 0);
  });

  // Posición del dropdown (calculada desde el input)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Recalcular posición del dropdown cuando se abre
  useEffect(() => {
    if (showDropdown && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [showDropdown, query]);

  return (
    <>
      <Header title="Inversiones" subtitle="Portfolio y seguimiento en tiempo real" />

      {/* Overlay + Dropdown (fuera del flujo, fixed, z-[9999]) */}
      {showDropdown && query.length > 0 && (
        <>
          {/* Overlay invisible para cerrar */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowDropdown(false)}
          />
          {/* Dropdown posicionado con fixed */}
          <div
            className="fixed z-[9999] rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-emerald-400/[0.15] max-h-[360px] overflow-y-auto"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              backgroundColor: "#0a1a10",
            }}
          >
            {searching && searchResults.length === 0 ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="text-xs text-text-muted">Buscando...</span>
              </div>
            ) : searchResults.length === 0 && !searching ? (
              <div className="py-6 text-center text-xs text-text-muted">
                No se encontraron resultados para &ldquo;{query}&rdquo;
              </div>
            ) : (
              searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => {
                    toggleFavorite(stock.symbol, stock.name, stock.exchange);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-500/15 transition-all cursor-pointer border-b border-emerald-400/[0.06] last:border-b-0 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/[0.10] flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                    {stock.symbol.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate text-white">
                      {stock.symbol}
                      <span className="text-text-muted font-normal ml-2">
                        {stock.name}
                      </span>
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {stock.exchange}{stock.type ? ` · ${stock.type}` : ""}
                    </p>
                  </div>
                  <Star
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isFavorite(stock.symbol)
                        ? "fill-amber-400 text-amber-400"
                        : "text-text-muted/40"
                    }`}
                  />
                </button>
              ))
            )}
          </div>
        </>
      )}

      <div className="p-4 md:p-7 space-y-6">
        {/* Buscador + controles */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Buscar acciones, ETFs, índices... (ej: AAPL, SPY, S&P)"
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-emerald-400/[0.04] backdrop-blur-md border border-emerald-400/[0.10] text-text-primary text-sm placeholder:text-text-muted focus:border-emerald-400/[0.25] focus:outline-none focus:ring-1 focus:ring-emerald-400/[0.15] transition-all"
              />
              {query.length > 0 && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSearchResults([]);
                    setShowDropdown(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Live toggle */}
            <button
              onClick={() => setLiveEnabled((p) => !p)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                liveEnabled
                  ? "bg-emerald-400/[0.08] border-emerald-400/[0.20] text-emerald-400"
                  : "bg-emerald-400/[0.02] border-emerald-400/[0.08] text-text-muted"
              }`}
              title={liveEnabled ? "Auto-refresh activo (15s)" : "Auto-refresh desactivado"}
            >
              {liveEnabled ? <Wifi className="w-4.5 h-4.5" /> : <WifiOff className="w-4.5 h-4.5" />}
            </button>

            {/* Manual refresh */}
            <button
              onClick={() => loadStocks(true)}
              disabled={refreshing}
              className="p-3 rounded-xl bg-emerald-400/[0.04] border border-emerald-400/[0.10] text-text-secondary hover:bg-emerald-400/[0.08] hover:text-emerald-400 hover:border-emerald-400/[0.20] transition-all cursor-pointer disabled:opacity-50"
              title="Refrescar cotizaciones"
            >
              <RefreshCw className={`w-4.5 h-4.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Indicador de estado */}
          <div className="flex items-center gap-2 mt-2">
            {liveEnabled && (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400/70 font-medium">EN VIVO</span>
              </div>
            )}
            {lastUpdate && (
              <span className="text-xs text-text-muted">
                Última actualización: {lastUpdate.toLocaleTimeString("es-ES")}
              </span>
            )}
          </div>
        </div>

        {/* Favoritos del usuario */}
        {favorites.length > 0 && (
          <div className="animate-fade-in-up">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Mis favoritos
              <span className="text-xs text-text-muted font-normal">({favorites.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favorites.map((fav) => {
                const quote = getQuote(fav.ticker);
                const isUp = (quote?.change ?? 0) >= 0;
                return (
                  /* Wrapper: borde gradiente neon top→bottom */
                  <div
                    key={fav.id}
                    className={`rounded-2xl p-px bg-gradient-to-b ${
                      isUp
                        ? "from-emerald-400/60 via-emerald-400/15 to-emerald-400/25 shadow-[0_0_15px_rgba(52,211,153,0.08),inset_0_0_15px_rgba(52,211,153,0.03)] hover:shadow-[0_0_25px_rgba(52,211,153,0.15),0_8px_40px_rgba(52,211,153,0.10)]"
                        : "from-red-400/60 via-red-400/15 to-red-400/25 shadow-[0_0_15px_rgba(248,113,113,0.06),inset_0_0_15px_rgba(248,113,113,0.02)] hover:shadow-[0_0_25px_rgba(248,113,113,0.12),0_8px_40px_rgba(248,113,113,0.08)]"
                    } hover:-translate-y-0.5 transition-all duration-300`}
                  >
                    <div
                      className={`relative bg-gradient-to-br ${
                        isUp
                          ? "from-emerald-500/[0.02] via-emerald-400/[0.01]"
                          : "from-red-500/[0.02] via-red-400/[0.01]"
                      } to-transparent bg-[var(--bg-base)] backdrop-blur-xl rounded-[15px] p-5 h-full`}
                    >
                    <button
                      onClick={() => removeFavorite(fav.ticker)}
                      className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-white/[0.08] text-white/70 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${
                          isUp ? "bg-emerald-400/[0.10]" : "bg-red-400/[0.10]"
                        } flex items-center justify-center text-xs font-bold ${
                          isUp ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {fav.ticker.slice(0, 3)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{fav.ticker}</p>
                        <p className="text-xs text-white/60 truncate">{fav.name}</p>
                      </div>
                    </div>
                    {quote ? (
                      <div className="flex items-end justify-between">
                        <p className="text-xl font-bold tracking-tight font-[family-name:var(--font-mono)] text-white">
                          {formatPrice(quote.price, quote.currency)}
                        </p>
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                            isUp
                              ? "bg-emerald-400/[0.10] text-emerald-400"
                              : "bg-red-400/[0.10] text-red-400"
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
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                        <p className="text-xs text-white/50">Obteniendo cotización...</p>
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Listado completo de stocks populares */}
        <div className="animate-fade-in-up">
          <h2 className="text-lg font-semibold mb-4">Mercado</h2>

          {loadingStocks ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              <span className="ml-3 text-sm text-text-muted">Cargando cotizaciones...</span>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-400/[0.03] to-transparent backdrop-blur-xl border border-emerald-400/[0.08] rounded-2xl overflow-hidden">
              {/* Header de tabla */}
              <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_100px_100px_90px_90px_44px] gap-2 px-5 py-3 border-b border-emerald-400/[0.06] text-xs text-text-muted font-medium uppercase tracking-wider">
                <span>Activo</span>
                <span className="text-right hidden md:block">Precio</span>
                <span className="text-right hidden md:block">Cambio</span>
                <span className="text-right hidden md:block">% Cambio</span>
                <span className="text-right hidden md:block">Cap.</span>
                <span className="text-right md:hidden">Precio</span>
                <span></span>
              </div>

              {/* Filas */}
              {sortedStocks.map((stock) => {
                const isUp = stock.change >= 0;
                const fav = isFavorite(stock.symbol);

                return (
                  <div
                    key={stock.symbol}
                    className={`grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_100px_100px_90px_90px_44px] gap-2 items-center px-5 py-3.5 border-b border-emerald-400/[0.03] last:border-b-0 hover:bg-emerald-400/[0.03] transition-all ${
                      fav ? "bg-amber-400/[0.02]" : ""
                    }`}
                  >
                    {/* Activo */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg ${
                          isUp ? "bg-emerald-400/[0.08]" : "bg-red-400/[0.08]"
                        } flex items-center justify-center text-xs font-bold ${
                          isUp ? "text-emerald-400" : "text-red-400"
                        } shrink-0`}
                      >
                        {stock.symbol.slice(0, 3)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold flex items-center gap-1.5">
                          {stock.symbol}
                          {fav && (
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          )}
                        </p>
                        <p className="text-xs text-text-muted truncate">{stock.name}</p>
                      </div>
                    </div>

                    {/* Precio - mobile */}
                    <div className="md:hidden text-right">
                      <p className="text-[13px] font-semibold font-[family-name:var(--font-mono)]">
                        {formatPrice(stock.price, stock.currency)}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          isUp ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {isUp ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </p>
                    </div>

                    {/* Precio - desktop */}
                    <p className="text-[13px] font-semibold text-right font-[family-name:var(--font-mono)] hidden md:block">
                      {formatPrice(stock.price, stock.currency)}
                    </p>

                    {/* Cambio */}
                    <p
                      className={`text-[13px] font-medium text-right font-[family-name:var(--font-mono)] hidden md:block ${
                        isUp ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {isUp ? "+" : ""}
                      {stock.change.toFixed(2)}
                    </p>

                    {/* % Cambio */}
                    <div
                      className={`hidden md:flex items-center justify-end gap-1 text-[12px] font-semibold ${
                        isUp ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {isUp ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isUp ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </div>

                    {/* Market Cap */}
                    <p className="text-[12px] text-text-secondary text-right hidden md:block">
                      {stock.marketCap ? formatMarketCap(stock.marketCap) : "—"}
                    </p>

                    {/* Favorito */}
                    <button
                      onClick={() => toggleFavorite(stock.symbol, stock.name, stock.exchange)}
                      className="p-2 rounded-lg hover:bg-emerald-400/[0.08] transition-all cursor-pointer justify-self-end"
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${
                          fav
                            ? "fill-amber-400 text-amber-400"
                            : "text-text-muted hover:text-amber-400"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
