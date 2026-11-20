"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (profile) {
    await supabase.from("activity_logs").insert({ user_id: profile.id, action: "auth.logout" });
  }
  await supabase.auth.signOut();
  redirect("/admin/login");
}
