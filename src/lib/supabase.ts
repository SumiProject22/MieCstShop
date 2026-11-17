import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function cleanEnvValue(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().replace(/^['"]|['"]$/g, '');
}

function normalizeSupabaseBaseUrl(rawUrl: string): string {
  const cleaned = cleanEnvValue(rawUrl);
  if (!cleaned || cleaned.includes('your-project-id')) {
    return '';
  }

  const withProtocol = /^https?:\/\//i.test(cleaned)
    ? cleaned
    : `https://${cleaned}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return '';
    }
    // Gunakan origin murni (mis. https://xxxx.supabase.co) agar tidak terjadi path ganda
    // seperti /rest/v1/rest/v1/products yang memicu error "Invalid path specified in request URL"
    return parsed.origin;
  } catch {
    return '';
  }
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseUrl = normalizeSupabaseBaseUrl(
  typeof rawUrl === 'string' ? rawUrl : ''
);
const supabaseAnonKey = cleanEnvValue(rawAnonKey);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
);

function buildSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('Gagal menginisialisasi Supabase client:', err);
    return null;
  }
}

export const supabase: SupabaseClient | null = buildSupabaseClient();
