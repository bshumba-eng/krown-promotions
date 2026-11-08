# KROWN Boxing Promotions — Premium GitHub Pages Website

Static HTML/CSS/JavaScript website designed for GitHub Pages.

## Included
- Premium black/gold KROWN visual system
- Responsive navigation and mobile menu
- Scroll reveal animations from left/right
- Event countdown
- Add-to-calendar `.ics` generator
- Event share/copy action
- QR-code modal for the website, ticket page and October Madness page
- QR download button
- Ticket links to official Eventbrite listings
- Live Centre / broadcast-ready section
- Founder section for Jordan Burnett
- KROWN and Jordan social links
- Fighter roster area ready for approved fighter data
- Archive area
- Support/donate pathway without inventing an unverified payment destination
- Subscribe UI
- Contact/enquiry UI
- Reduced-motion accessibility support
- SEO/Open Graph metadata

## Current verified event data
KROWN Road To Glory — Saturday 5 December 2026, 3 PM–11 PM, Ashbourne House Hotel, Ashbourne. Eventbrite currently advertises 15+ fights, 6 championship title fights, an 8-man Prizefighter tournament and a €5,000 winner's prize.

## Important verification boundaries
This demo deliberately does NOT invent:
- a KROWN email address
- an official livestream URL
- a donation/payment URL
- fighter names or records that have not been supplied/verified
- customer testimonials

When KROWN supplies an official livestream URL, donation/payment link and receiving email address, update the corresponding constants/links in `script.js` and `index.html`.

## Jordan Burnett media
`images/jordan-burnett.jpg` is a locally stored public portrait sourced from NNSM's public talent page for demo purposes. Confirm KROWN's media rights/approval before commercial publication.

## GitHub Pages
1. Upload the contents of this folder to the repository root.
2. Commit to `main`.
3. Repository Settings → Pages.
4. Source: Deploy from a branch.
5. Branch: `main` and folder `/ (root)`.
6. Save.

## QR library
The QR generator uses QRCode.js from jsDelivr. If you want a fully offline deployment, download and vendor the library into the repository.
