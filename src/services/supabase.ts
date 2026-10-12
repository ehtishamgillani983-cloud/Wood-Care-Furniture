import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://qhqahlykekweryenrnli.supabase.co';
const defaultKey = 'sb_publishable_euiALbCu-XTAetOMaZWEQQ_P8xxDGNe';

const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') || 
  defaultUrl;

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)) || 
  (typeof process !== 'undefined' ? (process.env?.VITE_SUPABASE_PUBLISHABLE_KEY || process.env?.VITE_SUPABASE_ANON_KEY) : '') || 
  defaultKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

