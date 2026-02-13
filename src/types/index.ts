import type {
  Transaction,
  Category,
  Budget,
  Investment,
  Alert,
  PriceHistory,
  ChartPreference,
  TransactionType,
  BudgetPeriod,
  InvestmentType,
} from "@/generated/prisma/client";

// Re-export Prisma types
export type {
  Transaction,
  Category,
  Budget,
  Investment,
  Alert,
  PriceHistory,
  ChartPreference,
  TransactionType,
  BudgetPeriod,
  InvestmentType,
};

// Extended types with relations
export type TransactionWithCategory = Transaction & {
  category: Category;
};

export type BudgetWithCategory = Budget & {
  category: Category;
  alerts: Alert[];
  spent?: number;
  percentage?: number;
};

export type InvestmentWithHistory = Investment & {
  priceHistory: PriceHistory[];
  totalValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
};

// Form types
export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  categoryId: string;
  isRecurring: boolean;
}

export interface BudgetFormData {
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
}

export interface InvestmentFormData {
  name: string;
  ticker: string;
  type: InvestmentType;
  units: number;
  avgBuyPrice: number;
  currency: string;
}

// Dashboard types
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  transactionCount: number;
  topCategories: {
    name: string;
    icon: string;
    color: string;
    amount: number;
    percentage: number;
  }[];
}

// Market data types
export interface MarketQuote {
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
  updatedAt: Date;
}

export interface MonthlyComparison {
  category: string;
  currentMonth: number;
  previousMonth: number;
  difference: number;
  differencePercent: number;
  trend: "up" | "down" | "stable";
}
