// Bridges the app's legacy `@/lib/supabase` imports to the Lovable Cloud client.
import { supabase } from "@/integrations/supabase/client";

export const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string;
export const supabaseAnonKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string;
export const supabaseProjectId = import.meta.env["VITE_SUPABASE_PROJECT_ID"] as string;
export const supabaseRestUrl = `${String(supabaseUrl ?? "").replace(/\/$/, "")}/rest/v1`;
export const storageBucket = "primeos";

export function createServiceRoleClient(): never {
  throw new Error("Service-role access is not available in the browser.");
}

export { supabase };
export default supabase;
