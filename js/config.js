const SUPABASE_URL = "https://uacnpssrurwhrshmsnja.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0iqwsODpmzEwIGHeggqaUw_30lpY68V";

// التأكد من تهيئة supabase وإتاحته في window بشكل صريح لتستطيع باقي الملفات الوصول إليه
if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
