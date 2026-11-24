/* ==========================================================================
   KROWN — configuration and seed content
   Only the events, links and founder details below come from KROWN's public
   pages. Fighters (fictional), partners, team roles, photos and finance figures
   are demo placeholders. Edit them here, or change them in the
   admin area. See README.md for how to go from demo to production.
   ========================================================================== */
window.KROWN_CONFIG = {
  brand: "KROWN Boxing Promotions",
  short: "KROWN",
  instagram: "https://www.instagram.com/krownboxingpromotion/",
  founderInstagram: "https://www.instagram.com/jordan_burnett96/?hl=en",
  tiktok: "",               // add the TikTok URL here when it launches
  whatsapp: "",             // add the WhatsApp Community invite link here when it launches
  appUrl: "app.html",       // replace with the App Store / Google Play / web-app link
  ppvPrice: 15,
  currency: "EUR",
  liveYouTubeId: "",        // YouTube video or live ID for the broadcast, e.g. "dQw4w9WgXcQ"
  stripePaymentLink: "",    // Stripe Payment Link (https://buy.stripe.com/...) for the PPV
  formEndpoint: "",         // optional Formspree-style URL; contact forms are also POSTed here
  demoMode: true,           // true = payments are simulated and forms are saved in this browser only
  contactEmail: "",         // no verified KROWN email yet: add it here when confirmed
  ticketTiers: [
    { id: "general", name: "General Admission", price: 35, blurb: "Demo tier. Real prices are on the official Eventbrite listing." },
    { id: "ringside", name: "Ringside", price: 85, blurb: "Demo tier. Real prices are on the official Eventbrite listing." },
    { id: "vip", name: "VIP Experience", price: 160, blurb: "Demo tier. Real prices are on the official Eventbrite listing." }
  ]
};

window.KROWN_SEED = {
  version: 1,

  events: [
    { id: "ev-oct", type: "fight", title: "October Madness", date: "2026-10-03T17:00", venue: "Ashbourne House Hotel, Frederick Street", city: "Ashbourne, Co. Meath", capacity: 500, ppv: false, published: true,
      ticketUrl: "https://www.eventbrite.ie/e/krown-boxing-promotions-october-madness-tickets-1998419811452",
      description: "KROWN Boxing Promotions at Ashbourne House Hotel. Saturday 3 October 2026, 5 PM to 11:30 PM. Sales have ended: see the official Eventbrite page." },
    { id: "ev-glory", type: "fight", title: "KROWN Road to Glory", date: "2026-12-05T15:00", venue: "Ashbourne House Hotel, Frederick Street", city: "Ashbourne, Co. Meath", capacity: 500, ppv: true, published: true, featured: true,
      ticketUrl: "https://www.eventbrite.ie/e/krown-road-to-glory-tickets-1998809885173",
      description: "KROWN Prizefighter. Saturday 5 December 2026, doors 3 PM, finishing 11 PM. 15+ fights, six championship title fights and an eight-man knockout tournament. The winner takes €5,000 in cash and the KROWN Prizefighter Champion title, at KROWN's biggest show so far." }
  ],

  /* Fictional demo roster. KROWN has not published its fighters, so these names, records and fights are made up for the demo. */
  fighters: [
    { id: "cian-mulvaney", name: "Cian Mulvaney", nickname: "Mulv", number: 1, weightClass: "Welterweight", record: { w: 12, l: 1, d: 0, ko: 8 }, age: 27, height: "5'11\"", reach: "73\"", stance: "Orthodox", hometown: "Navan", gloves: "#d6aa48", published: true, photo: "",
      bio: "Demo profile. Cian Mulvaney is a welterweight from Navan with 12 wins from 13 fights. Replace this with the real fighter profile.",
      nextFight: { eventId: "ev-glory", opponent: "Declan Vail", slot: "Main event", weight: "Welterweight", rounds: 10, ticketUrl: "" },
      previousFights: [
        { date: "2026-10-03", opponent: "Rory Kinsella", result: "W", method: "KO 3", event: "Demo card" },
        { date: "2026-05-16", opponent: "Alan Teague", result: "W", method: "UD 8", event: "Demo card" },
        { date: "2025-11-22", opponent: "Pavel Nemec", result: "W", method: "TKO 5", event: "Demo card" },
        { date: "2025-06-14", opponent: "Seán Doran", result: "L", method: "SD 8", event: "Demo card" }
      ],
      training: { venue: "Demo Boxing Club", address: "Navan, Ireland", days: "Saturdays", time: "11:00 to 12:30", note: "Demo session. Real training details will be published by KROWN." } },
    { id: "tadhg-corrigan", name: "Tadhg Corrigan", nickname: "The Closer", number: 2, weightClass: "Middleweight", record: { w: 10, l: 0, d: 0, ko: 9 }, age: 25, height: "6'0\"", reach: "76\"", stance: "Southpaw", hometown: "Drogheda", gloves: "#ffffff", published: true, photo: "",
      bio: "Demo profile. Tadhg Corrigan is a middleweight from Drogheda with 10 wins from 10 fights. Replace this with the real fighter profile.",
      nextFight: { eventId: "ev-glory", opponent: "Marek Sobol", slot: "Co-main event", weight: "Middleweight", rounds: 10, ticketUrl: "" },
      previousFights: [
        { date: "2026-10-03", opponent: "Luke Brennock", result: "W", method: "KO 2", event: "Demo card" },
        { date: "2026-04-18", opponent: "Marcus Hale", result: "W", method: "KO 4", event: "Demo card" },
        { date: "2025-10-11", opponent: "Iván Soto", result: "W", method: "TKO 1", event: "Demo card" }
      ],
      training: { venue: "Demo Boxing Club", address: "Drogheda, Ireland", days: "Saturdays", time: "11:00 to 12:30", note: "Demo session. Real training details will be published by KROWN." } },
    { id: "fionn-halloran", name: "Fionn Halloran", nickname: "Hollow", number: 3, weightClass: "Lightweight", record: { w: 9, l: 2, d: 1, ko: 4 }, age: 26, height: "5'8\"", reach: "68\"", stance: "Orthodox", hometown: "Ashbourne", gloves: "#d6aa48", published: true, photo: "",
      bio: "Demo profile. Fionn Halloran is a lightweight from Ashbourne with 9 wins from 12 fights. Replace this with the real fighter profile.",
      nextFight: { eventId: "ev-glory", opponent: "Kieran Dray", slot: "Chief supporting bout", weight: "Lightweight", rounds: 8, ticketUrl: "" },
      previousFights: [
        { date: "2026-10-03", opponent: "Declan Voss", result: "D", method: "MD 8", event: "Demo card" },
        { date: "2026-03-21", opponent: "Kyle Mercer", result: "W", method: "UD 8", event: "Demo card" },
        { date: "2025-09-13", opponent: "Tomasz Wrona", result: "L", method: "SD 8", event: "Demo card" }
      ],
      training: { venue: "Demo Boxing Club", address: "Ashbourne, Ireland", days: "Saturdays", time: "11:00 to 12:30", note: "Demo session. Real training details will be published by KROWN." } },
    { id: "eoghan-brogan", name: "Eoghan Brogan", nickname: "The Wall", number: 4, weightClass: "Heavyweight", record: { w: 8, l: 3, d: 0, ko: 7 }, age: 30, height: "6'5\"", reach: "81\"", stance: "Orthodox", hometown: "Dundalk", gloves: "#ffffff", published: true, photo: "",
      bio: "Demo profile. Eoghan Brogan is a heavyweight from Dundalk with 8 wins from 11 fights. Replace this with the real fighter profile.",
      nextFight: { eventId: "ev-glory", opponent: "Luca Ferrante", slot: "Featured bout", weight: "Heavyweight", rounds: 8, ticketUrl: "" },
      previousFights: [
        { date: "2026-10-03", opponent: "Bjorn Haldane", result: "W", method: "TKO 4", event: "Demo card" },
        { date: "2026-02-14", opponent: "Gary Stoker", result: "L", method: "UD 8", event: "Demo card" },
        { date: "2025-08-30", opponent: "Nico Farrow", result: "W", method: "KO 2", event: "Demo card" }
      ],
      training: { venue: "Demo Boxing Club", address: "Dundalk, Ireland", days: "Saturdays", time: "11:00 to 12:30", note: "Demo session. Real training details will be published by KROWN." } },
    { id: "niall-costigan", name: "Niall Costigan", nickname: "Cos", number: 5, weightClass: "Super Welterweight", record: { w: 7, l: 1, d: 0, ko: 3 }, age: 24, height: "5'10\"", reach: "71\"", stance: "Orthodox", hometown: "Trim", gloves: "#d6aa48", published: true, photo: "",
      bio: "Demo profile. Niall Costigan is a super welterweight from Trim with 7 wins from 8 fights. Replace this with the real fighter profile.",
      nextFight: { eventId: "ev-glory", opponent: "Jordan Pike", slot: "Featured bout", weight: "Super Welterweight", rounds: 8, ticketUrl: "" },
      previousFights: [
        { date: "2026-10-03", opponent: "Oisín Pryor", result: "W", method: "UD 6", event: "Demo card" },
        { date: "2026-01-24", opponent: "Dale Rennick", result: "W", method: "UD 6", event: "Demo card" },
        { date: "2025-07-19", opponent: "Cathal Moy", result: "L", method: "UD 6", event: "Demo card" }
      ],
      training: { venue: "Demo Boxing Club", address: "Trim, Ireland", days: "Saturdays", time: "11:00 to 12:30", note: "Demo session. Real training details will be published by KROWN." } },
    { id: "aidan-quirke", name: "Aidan Quirke", nickname: "Quick", number: 6, weightClass: "Featherweight", record: { w: 6, l: 0, d: 0, ko: 2 }, age: 23, height: "5'7\"", reach: "69\"", stance: "Southpaw", hometown: "Ratoath", gloves: "#ffffff", published: true, photo: "",
      bio: "Demo profile. Aidan Quirke is a featherweight from Ratoath with 6 wins from 6 fights. Replace this with the real fighter profile.",
      nextFight: { eventId: "ev-glory", opponent: "Ben Ashdown", slot: "Undercard", weight: "Featherweight", rounds: 6, ticketUrl: "" },
      previousFights: [
        { date: "2026-10-03", opponent: "Shane Egan", result: "W", method: "UD 6", event: "Demo card" },
        { date: "2026-03-07", opponent: "Ruan Botha", result: "W", method: "TKO 3", event: "Demo card" },
        { date: "2025-09-27", opponent: "Mikey Lorne", result: "W", method: "UD 4", event: "Demo card" }
      ],
      training: { venue: "Demo Boxing Club", address: "Ratoath, Ireland", days: "Saturdays", time: "11:00 to 12:30", note: "Demo session. Real training details will be published by KROWN." } }
  ],

  /* Fighter pull: used to weight the demo analytics so the stats pages tell a believable story. */
  fighterPull: { "cian-mulvaney": 1.0, "tadhg-corrigan": 0.8, "fionn-halloran": 0.55, "eoghan-brogan": 0.42, "niall-costigan": 0.3, "aidan-quirke": 0.22 },

  photos: [
    { id: "p1", cat: "Fight Night", title: "Walkout (demo image)", scene: "spot", seed: 3 },
    { id: "p2", cat: "Fight Night", title: "Main event (demo image)", scene: "ring", seed: 5 },
    { id: "p3", cat: "Weigh-In", title: "Face-off (demo image)", scene: "scale", seed: 7 },
    { id: "p4", cat: "Training", title: "Pad work in camp (demo image)", scene: "gloves", seed: 9 },
    { id: "p5", cat: "Crowd", title: "The crowd (demo image)", scene: "crowd", seed: 11 },
    { id: "p6", cat: "Press", title: "Press conference (demo image)", scene: "mic", seed: 13 },
    { id: "p7", cat: "Fight Night", title: "Ring set-up (demo image)", scene: "ring", seed: 15 },
    { id: "p8", cat: "Training", title: "Roadwork before sunrise (demo image)", scene: "spot", seed: 17 },
    { id: "p9", cat: "Weigh-In", title: "On the scales (demo image)", scene: "scale", seed: 19 },
    { id: "p10", cat: "Crowd", title: "Ringside energy (demo image)", scene: "crowd", seed: 21 },
    { id: "p11", cat: "Press", title: "Head to head (demo image)", scene: "mic", seed: 23 },
    { id: "p12", cat: "Training", title: "Sparring day (demo image)", scene: "gloves", seed: 25 }
  ],

  videos: [
    { id: "v1", title: "Camp Diaries", cat: "Fight Prep", length: "6:42", youtubeId: "", scene: "gloves", seed: 31,
      blurb: "Demo video slot. Inside the early weeks of camp, from roadwork to the first hard sparring rounds." },
    { id: "v2", title: "Scouting the Venue", cat: "Locations", length: "4:18", youtubeId: "", scene: "crowd", seed: 33,
      blurb: "Demo video slot. Sightlines, capacity, fighter access and atmosphere." },
    { id: "v3", title: "Building the Ring", cat: "Event Set-Up", length: "5:09", youtubeId: "", scene: "ring", seed: 35,
      blurb: "Demo video slot. From an empty hall to a fight-night arena in one day." },
    { id: "v4", title: "Fight Week: Fighter Prep", cat: "Fight Prep", length: "7:21", youtubeId: "", scene: "spot", seed: 37,
      blurb: "Demo video slot. Weight cuts, final pad sessions and fight-week routines." },
    { id: "v5", title: "Lighting and Stage Design", cat: "Event Set-Up", length: "3:55", youtubeId: "", scene: "mic", seed: 39,
      blurb: "Demo video slot. The crew behind the walkout lights, screens and sound." },
    { id: "v6", title: "Choosing the Event Location", cat: "Locations", length: "5:33", youtubeId: "", scene: "scale", seed: 41,
      blurb: "Demo video slot. A look at the shortlist for the next KROWN event." }
  ],

  team: {
    leadership: [
      { name: "Jordan Burnett", role: "Founder", bio: "Jordan “The Upset” Burnett is a fighter, entrepreneur and the founder of KROWN Boxing Promotions." }
    ],
    behind: [
      { name: "Coaches and cornermen", text: "Demo text. The trainers and cut men who prepare every fighter for the first bell." },
      { name: "Medical and safety", text: "Demo text. Ringside doctors, paramedics and licensed officials. Fighter safety comes first." },
      { name: "Media and content", text: "Demo text. The camera crew, editors and photographers who capture the night." },
      { name: "Fighter welfare", text: "Demo text. Support for nutrition, recovery and life outside the ring." }
    ],
    events: [
      { name: "Event Director", role: "Role placeholder", bio: "Owns the run sheet from doors to final bell." },
      { name: "Production Manager", role: "Role placeholder", bio: "Lighting, sound, screens and the walkout experience." },
      { name: "Ticketing and Guest Relations", role: "Role placeholder", bio: "Gets every fan through the door and to their seat." },
      { name: "Safety and Security Lead", role: "Role placeholder", bio: "Keeps the venue, the fighters and the fans safe." }
    ]
  },

  sponsors: [
    { id: "sp-1", name: "Partner slot 1", tier: "Official Partner" },
    { id: "sp-2", name: "Partner slot 2", tier: "Event Sponsor" },
    { id: "sp-3", name: "Partner slot 3", tier: "Supporting Partner" }
  ],

  openingBalance: 18500
};
