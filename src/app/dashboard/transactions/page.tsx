import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const type = params.type as "INCOME" | "EXPENSE" | "TRANSFER" | undefined;
  const showNew = params.new as "income" | "expense" | undefined;

  const where: Record<string, unknown> = { userId: user.id };
  if (type) where.type = type;

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.category.findMany({
      where: { OR: [{ userId: user.id }, { userId: null, isDefault: true }] },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <Header title="Transacciones" subtitle="Todos tus movimientos" />
      <div className="p-4 md:p-7 space-y-4">
        <TransactionFilters
          categories={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, type: c.type }))}
          currentType={type}
          showNewForm={showNew}
        />
        <TransactionList
          transactions={transactions.map((t) => ({
            id: t.id,
            description: t.description,
            amount: Number(t.amount),
            type: t.type,
            date: t.date.toISOString(),
            notes: t.notes,
            isRecurring: t.isRecurring,
            category: { id: t.category.id, name: t.category.name, icon: t.category.icon, color: t.category.color },
          }))}
        />
      </div>
    </>
  );
}
