import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

async function getAuthUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("receipt") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const mediaType = file.type as
      | "image/jpeg"
      | "image/png"
      | "image/gif"
      | "image/webp";

    if (
      !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type
      )
    ) {
      return NextResponse.json(
        { error: "Formato no soportado. Usa JPG, PNG, GIF o WebP." },
        { status: 400 }
      );
    }

    // Get user's categories to help with matching
    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId }, { userId: null, isDefault: true }],
      },
      select: { id: true, name: true, type: true, icon: true },
      orderBy: { name: "asc" },
    });

    const categoryList = categories
      .map((c) => `- "${c.name}" (${c.type}, id: "${c.id}")`)
      .join("\n");

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `Analiza esta imagen de un ticket de compra, recibo o captura de pantalla de una app bancaria. Extrae la siguiente información:

1. **amount**: El monto total de la transacción (solo el número, sin símbolo de moneda)
2. **description**: Una descripción corta y clara del gasto (máximo 50 caracteres)
3. **date**: La fecha de la transacción en formato YYYY-MM-DD. Si no la ves, usa la fecha de hoy: ${new Date().toISOString().split("T")[0]}
4. **type**: "EXPENSE" si es un gasto, "INCOME" si es un ingreso
5. **categoryId**: El ID de la categoría que mejor coincida de esta lista:
${categoryList}

6. **confidence**: Un número del 0 al 100 indicando qué tan seguro estás de la extracción

Responde ÚNICAMENTE con un JSON válido, sin markdown ni explicaciones. Ejemplo:
{"amount": 12.50, "description": "Café Starbucks", "date": "2026-02-20", "type": "EXPENSE", "categoryId": "uuid-aqui", "confidence": 85}

Si no puedes extraer la información, responde: {"error": "No pude leer la imagen"}`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No se pudo analizar la imagen" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(textBlock.text);

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    // Validate categoryId exists
    const validCategory = categories.find((c) => c.id === parsed.categoryId);
    if (!validCategory) {
      // Fallback to "Otros gastos" or first expense category
      const fallback =
        categories.find(
          (c) => c.name === "Otros gastos" && c.type === "EXPENSE"
        ) || categories.find((c) => c.type === parsed.type);
      if (fallback) {
        parsed.categoryId = fallback.id;
      }
    }

    return NextResponse.json({
      amount: Number(parsed.amount),
      description: String(parsed.description),
      date: String(parsed.date),
      type: parsed.type === "INCOME" ? "INCOME" : "EXPENSE",
      categoryId: String(parsed.categoryId),
      confidence: Number(parsed.confidence) || 0,
    });
  } catch (error) {
    console.error("Receipt parsing error:", error);
    return NextResponse.json(
      { error: "Error al analizar el recibo" },
      { status: 500 }
    );
  }
}
