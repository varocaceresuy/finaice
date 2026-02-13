import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { FavoriteStocks } from "@/components/dashboard/FavoriteStocks";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthName = format(now, "MMMM yyyy", { locale: es });

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: monthStart, lte: monthEnd },
    },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: "desc" },
    take: 5,
  });

  const categories = await prisma.category.findMany({
    where: {
      OR: [{ userId: user.id }, { userId: null, isDefault: true }],
    },
    orderBy: { name: "asc" },
  });

  const firstName = user.name?.split(" ")[0] || "👋";

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={`${monthName.charAt(0).toUpperCase() + monthName.slice(1)} · Resumen financiero`}
      />
      <div className="p-4 md:p-7 space-y-6">
        {/* Welcome */}
        <div className="animate-fade-in-up">
          <h2 className="text-2xl font-bold tracking-tight">
            Hola, {firstName}
          </h2>
          <p className="text-text-muted text-sm mt-0.5">
            Aquí tienes el resumen de este mes.
          </p>
        </div>

        {/* KPIs */}
        <OverviewCards
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          balance={balance}
          savingsRate={savingsRate}
        />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 animate-fade-in-up delay-5">
          <div className="lg:col-span-3">
            <RecentTransactions
              transactions={recentTransactions.map((t) => ({
                id: t.id,
                description: t.description,
                amount: Number(t.amount),
                type: t.type,
                date: t.date.toISOString(),
                category: {
                  name: t.category.name,
                  icon: t.category.icon,
                  color: t.category.color,
                },
              }))}
            />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <QuickActions
              categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
                icon: c.icon,
                type: c.type,
              }))}
            />
            <FavoriteStocks />
          </div>
        </div>
      </div>

      {/* FAB */}
      <a
        href="/dashboard/transactions?new=expense"
        className="fixed bottom-7 right-7 md:bottom-7 md:right-7 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-300 backdrop-blur-md text-[#060d0a] text-2xl font-bold flex items-center justify-center shadow-[0_4px_24px_rgba(52,211,153,0.25),0_0_0_1px_rgba(52,211,153,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:scale-110 hover:shadow-[0_8px_40px_rgba(52,211,153,0.35)] transition-all duration-300 z-50 mb-16 md:mb-0"
      >
        +
      </a>
    </>
  );
}
