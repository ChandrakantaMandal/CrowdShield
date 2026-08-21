const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[Config] Missing Supabase credentials.',
    !SUPABASE_URL ? 'EXPO_PUBLIC_SUPABASE_URL is not set.' : '',
    !SUPABASE_ANON_KEY ? 'EXPO_PUBLIC_SUPABASE_ANON_KEY is not set.' : '',
  );
}

export const Config = {
  SUPABASE_URL: SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ?? '',
  isConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
};
