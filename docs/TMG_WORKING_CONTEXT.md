# TMG Working Context



## Current working baseline



- Domain: www.thienminhgroup.net

- Storefront calls real Railway backend.

- KiotViet products API works, about 100 products.

- Banner API works, but persistence may still be in-memory.

- Settings/footer work.

- Public domain works.



## Not finished



- Public order submit.

- Supabase order storage.

- Telegram order notification.

- Admin JWT dashboard.

- Banner/settings persistence.

- Customer UI cleanup.

- SEO/UI polishing.



## Priority order



1. Public order submit.

2. Supabase order storage.

3. Telegram order notification.

4. Hide debug/API lines from customer UI.

5. Admin JWT dashboard.

6. Persist banner/settings to Supabase.

7. UI/SEO last.



## Safety principle



Never trade production stability for broad refactor.

Small, testable, rollback-safe changes only.



## Repo responsibility boundary



- This repository is only the public customer storefront UI.

- `thienminhgroup-frontend` is the internal dashboard/admin UI.

- `thienminhgroup-api` owns backend contracts, data persistence, KiotViet, Supabase, Telegram, n8n, and public/admin API endpoints.

- If storefront needs flash sale, new arrivals, featured products, combo products, banner/settings persistence, Kiot fields, order sync, or n8n behavior, define the frontend expectation here but implement the connection/contract in `thienminhgroup-api`.

- Do not copy dashboard/admin code into storefront, and do not implement backend logic inside storefront.

