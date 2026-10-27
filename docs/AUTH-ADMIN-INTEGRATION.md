# K-SPORT web identity and admin boundary

The public site now includes the visual shell for sign-in, registration and administration at `/login`, `/register`, and `/admin/*`. These screens intentionally do not create accounts, store passwords, or expose user data until the identity contract is supplied.

## Required contract

Set `KSPORT_AUTH_URL` to the identity service origin. The web adapter should receive:

- `POST /login` and `POST /register` with an application-owned session response.
- `GET /session` returning `{ user: { id, name, email, role } }` or `401`.
- `POST /logout` and CSRF protection appropriate to the chosen cookie/session strategy.
- Roles: `admin`, `editor`, `viewer`. Only `admin` may manage users; `admin` and `editor` may draft or publish news according to the policy defined by the existing Admin system.

Content and tournament mutations must remain behind the existing Admin/API boundary. The web app should call an explicit public/admin API adapter after authentication is verified; it must not connect directly to the desktop database or VPS filesystem.

Until those endpoints and cookie rules are confirmed, the UI remains read-only and shows an honest unavailable state. Do not replace that state with sample users, posts, events, permissions or a fake successful login.
