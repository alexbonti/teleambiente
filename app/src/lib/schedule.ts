/**
 * The broadcast grid.
 *
 * Source of truth: the published grid on teleambiente.tv/palinsesto-televisivo/
 * (read 2026-11-25). Times are the ones the site publishes; two entries share
 * Wednesday 21:30 (L'Architutto and Centomila Voci), which is a known editorial
 * inconsistency to be resolved by the newsroom — the UI renders both rather than
 * silently picking one.
 *
 * Until the CMS owns the schedule (M5), this file is the editorial source. It is
 * data, not presentation: pages should read through the helpers below.
 */

export const WEEKDAYS = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
] as const;

export const SHORT_DAYS = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"] as const;

export type Genre =
  | "attualità"
  | "territorio"
  | "salute"
  | "cultura"
  | "musica"
  | "sport"
  | "ambiente"
  | "politica"
  | "casa";

export interface Programme {
  slug: string;
  title: string;
  hosts: string[];
  genre: Genre;
  durationMin: number;
  description: string;
  /** YouTube playlist of the programme, when published. */
  playlistUrl?: string;
  /** Facebook page of the programme, when published. */
  facebookUrl?: string;
  /** True when the programme is a segment inside another broadcast. */
  insideOf?: string;
}

export interface Slot {
  programme: string;
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  /** 24h "HH:MM", Rome time. */
  start: string;
}

export const PROGRAMMES: Record<string, Programme> = {
  "a-tutto-mondo": {
    slug: "a-tutto-mondo",
    title: "A Tutto Mondo",
    hosts: ["Ertilia Giordano", "Fausto Piu", "Mattia Ciampicacigli"],
    genre: "attualità",
    durationMin: 75,
    description:
      "Contenitore di infotainment ambientale e sociale: approfondimenti su ecosistema, diritti e iniziative sul territorio locale e nazionale, con rubriche realizzate con enti e associazioni.",
    playlistUrl: "https://www.youtube.com/channel/UCf9ONyZWZ9NfdKDvJ6T2QZQ",
  },
  "sulla-via-della-natura": {
    slug: "sulla-via-della-natura",
    title: "Sulla Via della Natura",
    hosts: ["Fausto Piu"],
    genre: "ambiente",
    durationMin: 15,
    description:
      "Rubrica dentro “A Tutto Mondo”: in ogni puntata un ospite del mondo della scienza, del giornalismo o dell'attivismo racconta la propria battaglia per gli animali e per la natura.",
    insideOf: "a-tutto-mondo",
  },
  quovadis: {
    slug: "quovadis",
    title: "QuoVadis",
    hosts: ["Mattia Ciampicacigli"],
    genre: "territorio",
    durationMin: 20,
    description:
      "Realizzato con l'associazione VAS – Verdi, ambiente e società: il racconto della Capitale tra attualità, ambiente e istanze popolari.",
    insideOf: "a-tutto-mondo",
  },
  "capire-per-prevenire": {
    slug: "capire-per-prevenire",
    title: "Capire per Prevenire",
    hosts: ["Stefano Arcieri", "Andrea Arcieri"],
    genre: "salute",
    durationMin: 30,
    description:
      "Medicina e salute con i professori Stefano Arcieri (chirurgo generale) e Andrea Arcieri (internista e fisiatra). Dal format nasce anche lo speciale “Capire per Prevenire Mattina”.",
    facebookUrl: "https://www.facebook.com/capireperprevenire",
  },
  "vox-populi-roma": {
    slug: "vox-populi-roma",
    title: "Vox Populi Roma",
    hosts: ["Mariaelena Leggieri"],
    genre: "territorio",
    durationMin: 30,
    description:
      "Registrato in un quartiere della Capitale per raccontarne la storia attraverso la voce delle realtà che lo abitano: arte, cultura, cibo e tradizioni, dal centro alla periferia.",
  },
  "l-architutto": {
    slug: "l-architutto",
    title: "L'Architutto",
    hosts: ["Gianni Terenzi"],
    genre: "casa",
    durationMin: 30,
    description:
      "La bioarchitettura raccontata in modo semplice e concreto: consigli, esempi reali e soluzioni per costruire o ristrutturare in modo sostenibile, sano ed efficiente.",
  },
  "centomila-voci": {
    slug: "centomila-voci",
    title: "Centomila Voci",
    hosts: ["Andrea de Angelis", "Ruben Della Rocca", "Simone Altobelli"],
    genre: "sport",
    durationMin: 30,
    description:
      "Approfondimento sportivo sull'AS Roma: la Roma dello sport in ogni sfaccettatura, sul piano sociale oltre che sportivo.",
  },
  "l-intervista": {
    slug: "l-intervista",
    title: "L'Intervista",
    hosts: ["Giuseppe Vecchio", "Fabrizio Pezzani"],
    genre: "politica",
    durationMin: 30,
    description:
      "Approfondimento politico ed economico: un faccia a faccia tra il conduttore e il professor Fabrizio Pezzani sui temi di stretta attualità.",
  },
  "music-box": {
    slug: "music-box",
    title: "Music Box",
    hosts: ["Andrea Picariello"],
    genre: "musica",
    durationMin: 30,
    description:
      "Con 4quarti Magazine: artisti, giornalisti e addetti ai lavori per raccontare l'industria discografica e la scena indipendente italiana, tra musica e ambiente.",
  },
  "il-punto": {
    slug: "il-punto",
    title: "Il Punto",
    hosts: ["Giuseppe Vecchio"],
    genre: "attualità",
    durationMin: 45,
    description:
      "Il direttore editoriale incontra scrittori, giornalisti ed esperti per approfondire attualità, politica, economia e società.",
  },
  "pwr-action": {
    slug: "pwr-action",
    title: "PWR Action",
    hosts: ["Pro Wrestling Roma"],
    genre: "sport",
    durationMin: 40,
    description:
      "Il wrestling italiano e internazionale all'ombra del Colosseo: la compagnia capitolina porta sul piccolo schermo una delle discipline più spettacolari.",
  },
  ecoagenda: {
    slug: "ecoagenda",
    title: "EcoAgenda",
    hosts: ["Stefano Zago", "Ertilia Giordano"],
    genre: "ambiente",
    durationMin: 30,
    description:
      "Notiziario settimanale sull'ambiente: le notizie più importanti degli ultimi sette giorni, un focus approfondito con l'appunto tecnico di un esperto e il planner del direttore responsabile. In onda anche su Radio Radicale.",
  },
};

export const SLOTS: Slot[] = [
  { programme: "a-tutto-mondo", day: 2, start: "21:00" },
  { programme: "sulla-via-della-natura", day: 2, start: "21:00" },
  { programme: "quovadis", day: 2, start: "21:00" },
  { programme: "capire-per-prevenire", day: 2, start: "13:00" },
  { programme: "capire-per-prevenire", day: 3, start: "13:00" },
  { programme: "vox-populi-roma", day: 3, start: "21:00" },
  { programme: "l-architutto", day: 3, start: "21:30" },
  { programme: "centomila-voci", day: 3, start: "21:30" },
  { programme: "l-intervista", day: 4, start: "20:00" },
  { programme: "music-box", day: 4, start: "20:30" },
  { programme: "il-punto", day: 5, start: "22:30" },
  { programme: "pwr-action", day: 6, start: "20:20" },
  { programme: "ecoagenda", day: 6, start: "21:00" },
];

export function toMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function toHHMM(minutes: number): string {
  const normalised = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalised / 60);
  const mins = normalised % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** Current day + minutes in Europe/Rome, independent of the server timezone. */
export function romeNow(now: Date = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Sun";
  const hours = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minutes = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);

  return { day: day < 0 ? 0 : day, minutes: hours * 60 + minutes };
}

export interface OnAir {
  slot: Slot;
  programme: Programme;
  endsAt: string;
}

/** What is on air right now, if the published grid covers it. */
export function currentSlot(now: Date = new Date()): OnAir | null {
  const { day, minutes } = romeNow(now);
  for (const slot of SLOTS) {
    if (slot.day !== day) continue;
    const start = toMinutes(slot.start);
    const programme = PROGRAMMES[slot.programme];
    if (programme === undefined) continue;
    if (minutes >= start && minutes < start + programme.durationMin) {
      return { slot, programme, endsAt: toHHMM(start + programme.durationMin) };
    }
  }
  return null;
}

/** The next programme that will start, searching up to a week ahead. */
export function nextSlot(now: Date = new Date()): { slot: Slot; programme: Programme; when: "oggi" | "domani" | string } | null {
  const { day, minutes } = romeNow(now);

  for (let offset = 0; offset < 8; offset += 1) {
    const targetDay = (day + offset) % 7;
    const candidates = SLOTS.filter((slot) => slot.day === targetDay && toMinutes(slot.start) > (offset === 0 ? minutes : -1)).sort(
      (a, b) => toMinutes(a.start) - toMinutes(b.start),
    );
    const slot = candidates[0];
    if (slot === undefined) continue;
    const programme = PROGRAMMES[slot.programme];
    if (programme === undefined) continue;
    const when = offset === 0 ? "oggi" : offset === 1 ? "domani" : WEEKDAYS[targetDay] ?? "";
    return { slot, programme, when };
  }
  return null;
}

/** The next n programmes from now, across the week, with the day they air. */
export function upcomingSlots(count: number, now: Date = new Date()): Array<{ slot: Slot; programme: Programme; when: string }> {
  const { day, minutes } = romeNow(now);
  const entries: Array<{ slot: Slot; programme: Programme; when: string }> = [];

  for (let offset = 0; offset < 8 && entries.length < count; offset += 1) {
    const targetDay = (day + offset) % 7;
    const slots = SLOTS.filter((slot) => slot.day === targetDay && toMinutes(slot.start) >= (offset === 0 ? minutes : 0)).sort(
      (a, b) => toMinutes(a.start) - toMinutes(b.start),
    );
    for (const slot of slots) {
      const programme = PROGRAMMES[slot.programme];
      if (programme === undefined) continue;
      const when = offset === 0 ? "oggi" : offset === 1 ? "domani" : (WEEKDAYS[targetDay] ?? "");
      entries.push({ slot, programme, when });
    }
  }

  return entries.slice(0, count);
}

export function slotsForDay(day: number): Array<{ slot: Slot; programme: Programme }> {
  return SLOTS.filter((slot) => slot.day === day)
    .map((slot) => {
      const programme = PROGRAMMES[slot.programme];
      return programme === undefined ? null : { slot, programme };
    })
    .filter((entry): entry is { slot: Slot; programme: Programme } => entry !== null)
    .sort((a, b) => toMinutes(a.slot.start) - toMinutes(b.slot.start));
}

export function programmesByGenre(): Array<{ genre: Genre; programmes: Programme[] }> {
  const order: Genre[] = ["attualità", "territorio", "ambiente", "salute", "politica", "casa", "musica", "sport", "cultura"];
  return order
    .map((genre) => ({
      genre,
      programmes: Object.values(PROGRAMMES).filter((programme) => programme.genre === genre),
    }))
    .filter((group) => group.programmes.length > 0);
}
