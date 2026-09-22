const SUPABASE_URL = "https://uacnpssrurwhrshmsnja.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0iqwsODpmzEwIGHeggqaUw_30lpY68V";

// تهيئة العميل وتعيينه بشكل عام في window.supabaseClient
if (typeof supabase !== 'undefined' && supabase.createClient) {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
