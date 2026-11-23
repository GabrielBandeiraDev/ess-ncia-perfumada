import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type PerfumeRow = Tables<"perfumes">;

export async function listarPerfumes(): Promise<PerfumeRow[]> {
  const { data, error } = await supabase.from("perfumes").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function enviarFoto(file: File): Promise<string> {
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error } = await supabase.storage.from("perfumes").upload(path, file);
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage
    .from("perfumes")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw e2 ?? new Error("Falha ao gerar link da foto");
  return data.signedUrl;
}
