import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const defaultCategories = [
  // EXPENSE categories
  { name: "Vivienda", icon: "🏠", color: "#6366F1", type: "EXPENSE" as const },
  { name: "Alimentación", icon: "🛒", color: "#22C55E", type: "EXPENSE" as const },
  { name: "Transporte", icon: "🚗", color: "#3B82F6", type: "EXPENSE" as const },
  { name: "Salud", icon: "💊", color: "#EF4444", type: "EXPENSE" as const },
  { name: "Entretenimiento", icon: "🎬", color: "#A855F7", type: "EXPENSE" as const },
  { name: "Ropa", icon: "👕", color: "#EC4899", type: "EXPENSE" as const },
  { name: "Educación", icon: "📚", color: "#14B8A6", type: "EXPENSE" as const },
  { name: "Restaurantes", icon: "🍽️", color: "#F97316", type: "EXPENSE" as const },
  { name: "Suscripciones", icon: "📱", color: "#8B5CF6", type: "EXPENSE" as const },
  { name: "Seguros", icon: "🛡️", color: "#64748B", type: "EXPENSE" as const },
  { name: "Impuestos", icon: "📋", color: "#DC2626", type: "EXPENSE" as const },
  { name: "Regalos", icon: "🎁", color: "#F43F5E", type: "EXPENSE" as const },
  { name: "Mascotas", icon: "🐾", color: "#84CC16", type: "EXPENSE" as const },
  { name: "Otros gastos", icon: "📦", color: "#94A3B8", type: "EXPENSE" as const },
  // INCOME categories
  { name: "Nómina", icon: "💰", color: "#22C55E", type: "INCOME" as const },
  { name: "Freelance", icon: "💻", color: "#3B82F6", type: "INCOME" as const },
  { name: "Inversiones", icon: "📈", color: "#6366F1", type: "INCOME" as const },
  { name: "Alquiler", icon: "🏘️", color: "#F97316", type: "INCOME" as const },
  { name: "Otros ingresos", icon: "💵", color: "#14B8A6", type: "INCOME" as const },
];

async function main() {
  console.log("🌱 Seeding default categories...");

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: "00000000-0000-0000-0000-000000000000", // Workaround: null userId unique constraint
          name: cat.name,
          type: cat.type,
        },
      },
      update: {},
      create: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        isDefault: true,
        userId: null,
      },
    });
  }

  // Since upsert with null in unique constraint is tricky, let's use createMany with skipDuplicates
  await prisma.category.createMany({
    data: defaultCategories.map((cat) => ({
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
      isDefault: true,
      userId: null,
    })),
    skipDuplicates: true,
  });

  const count = await prisma.category.count({ where: { isDefault: true } });
  console.log(`✅ ${count} default categories ready.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
