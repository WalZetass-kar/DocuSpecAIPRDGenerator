import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJh...'; // Normally you'd want to handle this better but since it's local fallback

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
