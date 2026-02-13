import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/auth/login");
  }

  // Upsert user in our DB
  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {
      email: authUser.email!,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
      avatarUrl: authUser.user_metadata?.avatar_url,
    },
    create: {
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
      avatarUrl: authUser.user_metadata?.avatar_url,
    },
  });

  return user;
}
