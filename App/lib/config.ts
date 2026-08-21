const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[Config] Missing Supabase credentials.',
    !SUPABASE_URL ? 'EXPO_PUBLIC_SUPABASE_URL is not set.' : '',
    !SUPABASE_ANON_KEY ? 'EXPO_PUBLIC_SUPABASE_ANON_KEY is not set.' : '',
  );
}

if (!API_URL) {
  console.warn('[Config] EXPO_PUBLIC_API_URL is not set — backend API calls will fail.');
}

export const Config = {
  SUPABASE_URL: SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ?? '',
  API_URL: API_URL ?? '',
  isConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
  isBackendConfigured: Boolean(API_URL),
};
