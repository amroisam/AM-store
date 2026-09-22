const SUPABASE_URL = "https://uacnpssrurwhrshmsnja.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0iqwsODpmzEwIGHeggqaUw_30lpY68V";

if (typeof supabase === 'undefined') {
    var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
