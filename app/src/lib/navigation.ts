/** Curated navigation: hubs are topics, not the 51 legacy categories. */
export interface NavHub {
  slug: string;
  name: string;
  blurb: string;
}

export const NAV_HUBS: NavHub[] = [
  { slug: "attualita", name: "Attualità", blurb: "Politica, economia e società viste dall'ambiente." },
  { slug: "roma", name: "Roma & Lazio", blurb: "Il territorio, quartiere per quartiere." },
  { slug: "animali", name: "Animali", blurb: "Coesistenza, fauna, diritti e battaglie." },
  { slug: "clima", name: "Clima", blurb: "Crisi climatica, adattamento, territori." },
  { slug: "inquinamento", name: "Inquinamento", blurb: "Aria, acqua, suolo: i dati e chi li controlla." },
  { slug: "video", name: "Video", blurb: "I servizi e le interviste della redazione." },
];

export const PRIMARY_NAV = [
  { href: "/", label: "Home" },
  { href: "/temi/attualita", label: "Attualità" },
  { href: "/temi/roma", label: "Roma & Lazio" },
  { href: "/temi/animali", label: "Animali" },
  { href: "/temi/video", label: "Video" },
  { href: "/tv/diretta", label: "Diretta" },
  { href: "/tv/palinsesto", label: "Palinsesto" },
] as const;

export const CHANNELS = [
  { number: "221", label: "Nazionale" },
  { number: "18", label: "Lazio · Umbria" },
] as const;
