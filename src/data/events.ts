import type { CategoryId, CityId, EventItem, EventStatus, Venue } from '../types'

/**
 * Fixed demo clock: Friday 6 November 2026, 17:00 Prague time (CET, UTC+1).
 * All mock dates are relative to this so the demo and tests are deterministic.
 */
export const DEMO_NOW = new Date('2026-11-06T17:00:00+01:00')

/** Ticket price lists in the venue country's currency: 0 = free entry, [] = unknown. */
const FREE = [0]
const UNKNOWN: number[] = []
const prices = (...amounts: number[]) => amounts

const venue = (city: CityId) => (name: string, district: string): Venue => ({ name, district, city })
const praha = venue('praha')

const V = {
  jazzDock: praha('Jazz Dock', 'Smíchov'),
  roxy: praha('Roxy', 'Staré Město'),
  archa: praha('Divadlo Archa', 'Nové Město'),
  vystaviste: praha('Výstaviště Praha', 'Holešovice'),
  bioOko: praha('Bio Oko', 'Holešovice'),
  knihovna: praha('Městská knihovna', 'Staré Město'),
  akropolis: praha('Palác Akropolis', 'Žižkov'),
  planetarium: praha('Planetárium Praha', 'Holešovice'),
  narodni: praha('Národní divadlo', 'Nové Město'),
  meetFactory: praha('MeetFactory', 'Smíchov'),
  kasarna: praha('Kasárna Karlín', 'Karlín'),
  aero: praha('Kino Aero', 'Žižkov'),
  minor: praha('Divadlo Minor', 'Nové Město'),
  rudolfinum: praha('Rudolfinum', 'Staré Město'),
  crossClub: praha('Cross Club', 'Holešovice'),
  o2: praha('O2 universum', 'Vysočany'),
  dox: praha('DOX', 'Holešovice'),
  hrdinu: praha('Studio Hrdinů', 'Holešovice'),
  svetozor: praha('Kino Světozor', 'Nové Město'),
  svandovo: praha('Švandovo divadlo', 'Smíchov'),
  vagon: praha('Vagon', 'Nové Město'),
  lucerna: praha('Lucerna', 'Nové Město'),
  albertov: praha('Albertov', 'Nové Město'),
  veletrzni: praha('Veletržní palác', 'Holešovice'),
  galerieRudolfinum: praha('Galerie Rudolfinum', 'Staré Město'),
  forumKarlin: praha('Forum Karlín', 'Karlín'),
  trznice: praha('Holešovická tržnice', 'Holešovice'),
  stromovka: praha('Stromovka', 'Holešovice'),
} satisfies Record<string, Venue>

/** Venues outside Prague, for the location filter. */
const R = {
  janacek: venue('brno')('Janáčkovo divadlo', 'Brno-střed'),
  fleda: venue('brno')('Fléda', 'Brno-sever'),
  scala: venue('brno')('Kino Scala', 'Brno-střed'),
  moravskaGalerie: venue('brno')('Moravská galerie', 'Brno-střed'),
  cooltour: venue('ostrava')('Cooltour', 'Moravská Ostrava'),
  vitkovice: venue('ostrava')('Dolní oblast Vítkovice', 'Vítkovice'),
  depo: venue('plzen')('DEPO2015', 'Plzeň 3'),
  tyl: venue('plzen')('Divadlo J. K. Tyla', 'Plzeň 3'),
  jazzTibet: venue('olomouc')('Jazz Tibet Club', 'Olomouc'),
  lidoveSady: venue('liberec')('Lidové sady', 'Liberec'),
  // Slovakia: ticket prices in EUR
  novaScena: venue('bratislava')('Nová scéna', 'Staré Mesto'),
  kcDunaj: venue('bratislava')('KC Dunaj', 'Staré Mesto'),
  lumiere: venue('bratislava')('Kino Lumière', 'Staré Mesto'),
  sng: venue('bratislava')('Slovenská národná galéria', 'Staré Mesto'),
  tabacka: venue('kosice')('Tabačka Kulturfabrik', 'Staré Mesto'),
  kunsthalleKe: venue('kosice')('Kunsthalle Košice', 'Staré Mesto'),
  stanica: venue('zilina')('Stanica Žilina-Záriečie', 'Záriečie'),
  bagar: venue('nitra')('Divadlo Andreja Bagara', 'Staré Mesto'),
} satisfies Record<string, Venue>

const image = (category: CategoryId) => `/images/${category}.svg`

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Per-event signals for sorting and the editors'-pick filter:
 * [people interested ("Mám zájem"), added N days before DEMO_NOW, editors' pick?]
 */
const SIGNALS: Record<string, [interested: number, addedDaysAgo: number, pick?: true]> = {
  e01: [180, 12], e02: [640, 20], e03: [410, 30, true], e04: [2300, 60, true],
  e05: [95, 3], e06: [60, 1], e07: [1200, 45], e08: [310, 9], e09: [140, 14],
  e10: [1850, 90, true], e11: [520, 6, true], e12: [760, 4], e13: [120, 18],
  e14: [430, 40], e15: [270, 2], e16: [3400, 120], e17: [210, 5], e18: [330, 11, true],
  e19: [150, 7], e20: [85, 0], e21: [980, 50], e22: [70, 2], e23: [1600, 35, true],
  e24: [190, 6], e25: [2100, 25, true], e26: [880, 15], e27: [1400, 70, true],
  e28: [520, 16], e29: [50, 20], e30: [240, 8], e31: [390, 10],
  r01: [450, 22, true], r02: [160, 4], r03: [90, 3], r04: [300, 28], r05: [410, 9],
  r06: [1100, 13, true], r07: [75, 1], r08: [620, 40], r09: [55, 5], r10: [130, 7],
  s01: [380, 19, true], s02: [140, 6], s03: [520, 12, true], s04: [610, 33],
  s05: [450, 2], s06: [65, 1], s07: [120, 4], s08: [95, 8],
}

function ev(
  id: string,
  title: string,
  categories: EventItem['categories'],
  venue: Venue,
  startsAt: string,
  ticketPrices: readonly number[],
  extra: { endsAt?: string; status?: EventStatus } = {},
): EventItem {
  const signals = SIGNALS[id]
  if (!signals) throw new Error(`Missing SIGNALS entry for mock event ${id}`)
  const [interested, addedDaysAgo, pick] = signals
  return {
    id,
    title,
    categories,
    venue,
    imageUrl: image(categories[0]),
    startsAt,
    endsAt: extra.endsAt,
    ticketPrices,
    status: extra.status ?? 'onSale',
    editorsPick: pick ?? false,
    interested,
    addedAt: new Date(DEMO_NOW.getTime() - addedDaysAgo * DAY_MS).toISOString(),
  }
}

/** Fictional performers and productions at real Prague venues. */
export const EVENTS: EventItem[] = [
  // Pátek 6. 11. (today)
  ev('e01', 'Jazzový večer: Kvartet Martina Dvořáka', ['concerts'], V.jazzDock, '2026-11-06T20:00:00+01:00', prices(350)),
  ev('e02', 'Hluboká noc: techno do rána', ['parties'], V.roxy, '2026-11-06T23:00:00+01:00', prices(300, 450)),
  ev('e03', 'Proměna', ['theatre'], V.archa, '2026-11-06T19:30:00+01:00', prices(290, 390, 590)),
  ev('e04', 'Svátek světla', ['festivals', 'exhibitions'], V.vystaviste, '2026-09-23T10:00:00+02:00', prices(250), { endsAt: '2027-06-09T20:00:00+02:00' }),
  ev('e05', 'Animované kraťasy na Oku', ['film'], V.bioOko, '2026-11-06T20:30:00+01:00', prices(160)),
  ev('e06', 'Jak dýchají města: přednáška', ['other'], V.knihovna, '2026-11-06T18:00:00+01:00', FREE),
  ev('e07', 'Vltavín: akustické turné', ['concerts'], V.akropolis, '2026-11-06T20:00:00+01:00', prices(590), { status: 'soldOut' }),
  ev('e08', 'Hororový maraton', ['film'], V.aero, '2026-11-06T23:00:00+01:00', prices(260), { status: 'saleEnded' }),

  // Sobota 7. 11.
  ev('e09', 'Sobotní dopoledne pod hvězdami', ['kids'], V.planetarium, '2026-11-07T10:00:00+01:00', prices(120)),
  ev('e10', 'Labutí jezero', ['theatre'], V.narodni, '2026-11-07T19:00:00+01:00', prices(1450, 950, 450, 200)),
  ev('e11', 'Syntezátorová noc', ['concerts', 'parties'], V.meetFactory, '2026-11-07T21:00:00+01:00', prices(400)),
  ev('e12', 'Vinylový trh s DJs', ['festivals'], V.kasarna, '2026-11-07T12:00:00+01:00', FREE, { endsAt: '2026-11-07T22:00:00+01:00' }),
  ev('e13', 'Pohádky z kufru', ['kids', 'theatre'], V.minor, '2026-11-07T15:00:00+01:00', prices(180)),
  ev('e14', 'Komorní večer v Rudolfinu', ['concerts'], V.rudolfinum, '2026-11-07T19:30:00+01:00', prices(350, 650, 1200)),
  ev('e15', 'Dechovka & Bass', ['parties'], V.crossClub, '2026-11-07T23:00:00+01:00', UNKNOWN),
  ev('e16', 'Severní světla: Arena Tour 2026', ['concerts'], V.o2, '2026-11-07T20:00:00+01:00', prices(1290, 2490)),

  // Neděle 8. 11.
  ev('e17', 'Nedělní jazz jam', ['concerts'], V.jazzDock, '2026-11-08T20:00:00+01:00', FREE),
  ev('e18', 'Rodinná neděle v DOXu', ['kids', 'exhibitions'], V.dox, '2026-11-08T10:00:00+01:00', prices(140), { endsAt: '2026-11-08T18:00:00+01:00' }),
  ev('e19', 'Improvizační souboj', ['theatre'], V.hrdinu, '2026-11-08T19:00:00+01:00', prices(250)),
  ev('e20', 'Řeky Šumavy: projekce a debata', ['film', 'other'], V.svetozor, '2026-11-08T18:00:00+01:00', prices(180)),
  ev('e30', 'Ochutnávka moravských vín', ['gastro'], V.trznice, '2026-11-08T16:00:00+01:00', prices(450)),
  ev('e31', 'Noční běh Stromovkou', ['sport'], V.stromovka, '2026-11-08T18:30:00+01:00', prices(390)),

  // Next week
  ev('e21', 'Hamlet (in English)', ['theatre'], V.svandovo, '2026-11-10T19:00:00+01:00', prices(390, 690), { status: 'soldOut' }),
  ev('e22', 'Poezie a pivo', ['other'], V.vagon, '2026-11-11T20:00:00+01:00', UNKNOWN),
  ev('e23', 'Pražské jazzové noci', ['festivals', 'concerts'], V.lucerna, '2026-11-13T18:00:00+01:00', prices(2200, 1290, 790), { endsAt: '2026-11-15T23:00:00+01:00' }),
  ev('e24', 'Robotická dílna pro děti', ['kids'], V.knihovna, '2026-11-14T10:00:00+01:00', FREE),
  ev('e25', 'Koncert ke 17. listopadu', ['concerts', 'festivals'], V.albertov, '2026-11-17T16:00:00+01:00', FREE),
  ev('e26', 'Drum & Bass Arena', ['parties'], V.forumKarlin, '2026-11-20T22:00:00+01:00', prices(690, 990)),

  // Ongoing exhibitions
  ev('e27', 'Český modernismus 1900–1939', ['exhibitions'], V.veletrzni, '2026-09-01T10:00:00+02:00', prices(250), { endsAt: '2027-02-28T18:00:00+01:00' }),
  ev('e28', 'Mladá fotografie 2026', ['exhibitions'], V.galerieRudolfinum, '2026-10-20T10:00:00+02:00', FREE, { endsAt: '2026-12-31T18:00:00+01:00' }),

  // Outside Prague (location filter)
  ev('r01', 'Její pastorkyňa', ['theatre'], R.janacek, '2026-11-07T19:00:00+01:00', prices(990, 590, 290)),
  ev('r02', 'Brněnská noc kytar', ['concerts'], R.fleda, '2026-11-06T20:00:00+01:00', prices(350)),
  ev('r03', 'Filmový klub: Nová vlna', ['film'], R.scala, '2026-11-09T19:30:00+01:00', prices(120)),
  ev('r04', 'Moravské grafické bienále', ['exhibitions'], R.moravskaGalerie, '2026-10-10T10:00:00+02:00', FREE, { endsAt: '2027-01-17T18:00:00+01:00' }),
  ev('r05', 'Industriální techno noc', ['parties'], R.cooltour, '2026-11-07T22:00:00+01:00', prices(250, 350)),
  ev('r06', 'Světelná stezka Vítkovice', ['festivals', 'exhibitions'], R.vitkovice, '2026-11-13T17:00:00+01:00', FREE, { endsAt: '2026-11-15T22:00:00+01:00' }),
  ev('r07', 'Design talk: Město zítřka', ['other'], R.depo, '2026-11-10T18:00:00+01:00', FREE),
  ev('r08', 'Prodaná nevěsta', ['theatre'], R.tyl, '2026-11-08T17:00:00+01:00', prices(790, 450, 200), { status: 'soldOut' }),
  ev('r09', 'Jazzový čtvrtek', ['concerts'], R.jazzTibet, '2026-11-12T20:00:00+01:00', UNKNOWN),
  ev('r10', 'Dílna pro malé vědce', ['kids'], R.lidoveSady, '2026-11-07T10:00:00+01:00', prices(150)),

  // Slovakia (prices in EUR)
  ev('s01', 'Na skle maľované', ['theatre'], R.novaScena, '2026-11-07T19:00:00+01:00', prices(39, 25, 15)),
  ev('s02', 'Dunajský jazzový večer', ['concerts'], R.kcDunaj, '2026-11-06T20:30:00+01:00', prices(12)),
  ev('s03', 'Festival krátkych filmov', ['film', 'festivals'], R.lumiere, '2026-11-13T18:00:00+01:00', prices(6, 15), { endsAt: '2026-11-15T23:00:00+01:00' }),
  ev('s04', 'Slovenská moderna', ['exhibitions'], R.sng, '2026-10-01T10:00:00+02:00', FREE, { endsAt: '2027-02-28T18:00:00+01:00' }),
  ev('s05', 'Tabačka Night', ['parties'], R.tabacka, '2026-11-07T22:00:00+01:00', prices(8, 12)),
  ev('s06', 'Diskusia: Mesto a kultúra', ['other'], R.kunsthalleKe, '2026-11-10T18:00:00+01:00', FREE),
  ev('s07', 'Koncert na Stanici', ['concerts'], R.stanica, '2026-11-08T19:00:00+01:00', UNKNOWN),
  ev('s08', 'Rozprávky pre najmenších', ['kids', 'theatre'], R.bagar, '2026-11-08T10:30:00+01:00', prices(5)),

  // Already over at DEMO_NOW: must never be shown
  ev('e29', 'Polední jazz na Smíchově', ['concerts'], V.jazzDock, '2026-11-06T12:30:00+01:00', prices(150)),
]
