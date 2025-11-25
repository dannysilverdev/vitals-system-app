// Exponer el cliente supabase en window para debug temporal
import { supabase } from "@/lib/supabaseClient";

if (typeof window !== "undefined") {
  window.supabase = supabase;
}

console.log("🔍 Supabase expuesto en window.supabase");
