// Series formats, each tied to a 2026 short-video trend. The local generator
// rotates through these; the AI generator gets them as a menu to pick from.

export const FORMATS = [
  {
    id: "mundane",
    name: "The Everyday, Made Cinematic",
    trend: "Romanticizing ordinary routines is one of the strongest TikTok/Reels themes of 2026.",
    titles: [
      "Opening up at {time}",
      "The part of the job nobody films",
      "Our most satisfying 10 seconds",
      "What {pace} looks like at {name}",
      "The ritual before the first customer",
      "Closing time, the quiet version",
    ],
    hooks: [
      "POV: it's {time} and {city} is still asleep",
      "This is the most satisfying part of running a {type}",
      "Nobody talks about this part of owning a {type}",
      "Come with me to open {name}",
    ],
    shots: [
      "Close-up of hands doing the first task of the day",
      "Wide shot of the space before anyone arrives",
      "Slow-motion detail shot of {specialty}",
      "End on you looking at the camera, one-line sign-off",
    ],
  },
  {
    id: "answers",
    name: "Ask a {role}",
    trend: "Social is search: ~half of US consumers now search TikTok/Instagram before Google.",
    titles: [
      "How to choose a {type} in {city}",
      "How much does {specialty} really cost?",
      "{count} questions to ask before you book a {type}",
      "The mistake everyone makes with {specialty}",
      "Is {specialty} worth it? Honest answer",
      "What a {role} wishes you knew",
    ],
    hooks: [
      "If you're searching for a {type} in {city}, watch this first",
      "The question I get asked every single day",
      "A {role} answers the question you're too shy to ask",
      "Before you spend money on {specialty}, know this",
    ],
    shots: [
      "Talking head, question written as on-screen text",
      "Cut to a quick demo or example that proves the answer",
      "Show a real price, tool, or before/after",
      "Recap the answer in one sentence on screen",
    ],
  },
  {
    id: "proof",
    name: "Real Customers, Real Words",
    trend: "70% of shoppers look for user-generated content before buying.",
    titles: [
      "Reading our newest review out loud",
      "The review that made our week",
      "Why {audience} keep coming back",
      "A regular explains why they chose us",
      "Our harshest review, and what we changed",
    ],
    hooks: [
      "Someone left us this review and I need to talk about it",
      "We asked our regulars one question",
      "I didn't expect a customer to say this",
      "Reading our worst review on camera",
    ],
    shots: [
      "Screenshot of the review (get permission / blur the name)",
      "Your genuine reaction, unscripted",
      "B-roll of the product or service they mentioned",
      "Thank the customer and invite others to share",
    ],
  },
  {
    id: "dayn",
    name: "Day {n} of {challenge}",
    trend: "Serialized, numbered content outperforms one-off posts; 57% prefer brands with original series.",
    titles: [
      "Day {n}: {challenge}",
      "Day {n}: {challenge} (this one surprised me)",
      "Day {n}: {challenge}, the hardest one yet",
      "Day {n}: {challenge}, you picked this one",
    ],
    hooks: [
      "Day {n} of {challenge}",
      "Day {n}. Yesterday's comments chose today's challenge",
      "Day {n} of {challenge} and it's getting harder",
    ],
    shots: [
      "Big on-screen 'Day {n}' in the first frame",
      "Show the attempt in 3 quick cuts",
      "Reveal the result",
      "Ask viewers what tomorrow's episode should be",
    ],
  },
  {
    id: "insider",
    name: "Things I'd Never Do as a {role}",
    trend: "Niche, specific, insider humor and honesty drive shares and saves in 2026.",
    titles: [
      "{count} things I'd never do as a {role}",
      "Industry secret: {specialty} edition",
      "Red flags when picking a {type}",
      "What I'd do with $50 at a {type}",
      "Unpopular opinion from a {role}",
    ],
    hooks: [
      "As a {role}, I would never...",
      "I'll probably get in trouble for sharing this",
      "Red flags when you're choosing a {type}",
      "Unpopular opinion: {specialty} is overrated unless...",
    ],
    shots: [
      "Point at camera on each item, one quick cut per point",
      "Show the right way vs the wrong way side by side",
      "Keep it under 30 seconds, fast pace",
      "End with a question to spark comments",
    ],
  },
];

const CHALLENGES = [
  "making every customer's day a little better",
  "trying one new {specialty} idea",
  "showing one thing we do differently",
  "answering your comments",
];

const TIMES = ["5:45am", "6:30am", "7am", "the crack of dawn"];
const PACES = ["a Saturday rush", "a slow Tuesday", "the lunch rush", "a holiday week"];

export function slug(s) {
  return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function roleFor(type) {
  const t = String(type).toLowerCase().trim();
  const map = {
    bakery: "baker", cafe: "barista", "coffee shop": "barista", salon: "stylist",
    barbershop: "barber", barber: "barber", gym: "trainer", restaurant: "chef",
    "taco truck": "taquero", florist: "florist", dentist: "dentist",
    plumber: "plumber", realtor: "realtor", "tattoo shop": "tattoo artist",
    "nail salon": "nail tech", "auto shop": "mechanic", bookstore: "bookseller",
    "yoga studio": "yoga teacher", photographer: "photographer",
  };
  return map[t] ?? `${t} owner`;
}

// Search phrases people actually type into TikTok/Instagram search.
export function buildKeywords({ type, city, specialty }) {
  const t = type.toLowerCase();
  const c = city.trim();
  const s = specialty.toLowerCase();
  return [
    `best ${t} in ${c}`,
    `${s} ${c}`,
    `${t} near me`,
    `${c} ${t}`,
    `things to do in ${c}`,
    `how to choose a ${t}`,
    `${s} tips`,
    `${c} small business`,
  ];
}

export function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

export function pick(list, i) {
  return list[((i % list.length) + list.length) % list.length];
}

export const EXTRA = { CHALLENGES, TIMES, PACES };
