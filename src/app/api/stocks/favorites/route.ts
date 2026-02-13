import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// GET — obtener favoritos del usuario
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const favorites = await prisma.favoriteStock.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}

// POST — añadir favorito
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const { ticker, name, exchange } = await req.json();
  if (!ticker || !name) {
    return NextResponse.json({ error: "ticker y name requeridos" }, { status: 400 });
  }

  const fav = await prisma.favoriteStock.upsert({
    where: { userId_ticker: { userId, ticker } },
    update: { name, exchange },
    create: { userId, ticker, name, exchange },
  });

  return NextResponse.json(fav);
}

// DELETE — quitar favorito
export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const { ticker } = await req.json();
  if (!ticker) {
    return NextResponse.json({ error: "ticker requerido" }, { status: 400 });
  }

  await prisma.favoriteStock.deleteMany({
    where: { userId, ticker },
  });

  return NextResponse.json({ ok: true });
}
