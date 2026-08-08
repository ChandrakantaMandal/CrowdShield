import { supabase } from "@/lib/supabase";

export type ReportCategory = "Suspicious Activity" | "Emergency" | "Hazard" | "Other";

export type CreateReportInput = {
  category: ReportCategory;
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type Report = {
  id: string;
  user_id: string;
  category: ReportCategory;
  description: string | null;
  status: "pending" | "verified" | "resolved";
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export async function createReport(input: CreateReportInput) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not found");
  }

  const { error } = await supabase.from("reports").insert({
    user_id: user.id,
    category: input.category,
    description: input.description?.trim() || null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
  });

  if (error) {
    throw error;
  }
}

export async function getReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Report[];
}