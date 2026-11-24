# KROWN Boxing Promotions: website and admin

A static KROWN website and admin area that runs on GitHub Pages from the root of this repository. The earlier single-page KROWN site is kept in the `/original/` folder (https://bshumba-eng.github.io/krown-promotions/original/).

Site: https://bshumba-eng.github.io/krown-promotions/
Admin area: https://bshumba-eng.github.io/krown-promotions/admin/

**Demo admin login:** username `admin`, password `admin`.

## What is included

**Public site**

| Page | File | What it does |
| --- | --- | --- |
| Home | `index.html` | Next event banner and countdown, event tiles, "Explore KROWN" grid, the card, roster |
| Events | `events.html` | Upcoming and previous events, filters, "Add to calendar" and ticket checkout |
| Fighters | `fighters.html` | Roster with weight class filter and search |
| Fighter profile | `fighter.html?id=...` | Bio, record, next fight, previous fights |
| Photos | `photos.html` | Gallery with filters and a full-screen viewer |
| BTS | `bts.html` | Behind the scenes video slots |
| The Team | `team.html` | Founder, team roles and partners |
| Live | `live.html` | Pay-per-view page with a demo gate and a YouTube player |
| Contact | `contact.html` | Separate Sponsor, Fight and Collab forms |
| App | `app.html` | App preview page |

**Admin area** (`admin/index.html`): Dashboard, Calendar, Fighters, Payments, Stats, Requests and Logout.

## What is real and what is demo

Real, taken from KROWN's public pages: the brand, the Instagram links, the two events (October Madness on 3 October 2026 and KROWN Road to Glory on 5 December 2026), the Ashbourne House Hotel venue, the Eventbrite links and the founder, Jordan Burnett.

Demo placeholders: the four fighter profiles, partner slots, team roles, photos and video slots, and **every figure in the admin area** (sales, payments, stats, sample enquiries). No fighter names, records, prices or email addresses have been invented as real KROWN information. Replace the placeholders before using this for real. The demo ticket tiers and prices are not KROWN's real prices: use the Eventbrite links.

## Run it locally

No build step. From this folder:

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Where to change things

| To change | Edit |
| --- | --- |
| Instagram, TikTok, WhatsApp, app link, demo ticket tiers, PPV price, YouTube stream ID, Stripe link, contact email | `assets/js/data.js` (`KROWN_CONFIG`) |
| Events, fighters, team, photos, videos, partners | `assets/js/data.js` (`KROWN_SEED`) |
| Events and fighters while the site is running | Admin area, Calendar and Fighters |
| Colours and type | `assets/css/site.css` (variables at the top) |

## Important: this is a demo build

GitHub Pages only serves static files, so there is no server:

- **Data lives in each visitor's browser** (localStorage). Admin edits, contact form enquiries and test orders are saved on the device used, not shared between visitors.
- **The admin login is a demonstration gate**, not real security. Anyone who can read the site's JavaScript can see how it works. Do not store real personal or payment data in this version.
- **Payments are simulated.** No card is requested and no money moves.
- **The live stream gate is client-side.** Real pay-per-view protection needs a server to release the stream after payment.

## Going to production

Replace the demo storage layer (`assets/js/store.js`) with a real backend such as Supabase (tables, Auth with row level security, Storage), move payments to Stripe Checkout with a webhook, and replace the placeholder stats with real analytics. Never put a Supabase `service_role` key or a Stripe secret key in browser code.
