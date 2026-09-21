AM store - security setup

1) In Supabase SQL Editor, run: supabase/SECURITY_SETUP.sql
2) The admin account must already exist in Authentication > Users.
3) Its UUID must already be present in public.admin_users (this was done during setup).
4) Upload this folder to GitHub Pages.
5) Open admin.html and sign in with the Supabase email/password.

The browser uses only the Supabase Publishable Key. Never add a Secret/Service Role key.
