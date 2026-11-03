import type { CategoryId, EventItem, EventStatus, PriceInfo, Venue } from '../types'

/**
 * Fixed demo clock: Friday 6 November 2026, 17:00 Prague time (CET, UTC+1).
 * All mock dates are relative to this so the demo and tests are deterministic.
 */
export const DEMO_NOW = new Date('2026-11-06T17:00:00+01:00')

const FREE: PriceInfo = { kind: 'free' }
const UNKNOWN: PriceInfo = { kind: 'unknown' }
const czk = (fromCzk: number, toCzk?: number): PriceInfo => ({ kind: 'paid', fromCzk, toCzk })

const praha = (name: string, district: string): Venue => ({ name, district, city: 'Praha' })

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

const image = (category: CategoryId) => `/images/${category}.svg`

function ev(
  id: string,
  title: string,
  categories: CategoryId[],
  venue: Venue,
  startsAt: string,
  price: PriceInfo,
  extra: { endsAt?: string; status?: EventStatus } = {},
): EventItem {
  return {
    id,
    title,
    categories,
    venue,
    imageUrl: image(categories[0]),
    startsAt,
    endsAt: extra.endsAt,
    price,
    status: extra.status ?? 'onSale',
  }
}

/** Fictional performers and productions at real Prague venues. */
export const EVENTS: EventItem[] = [
  // Pátek 6. 11. (today)
  ev('e01', 'Jazzový večer: Kvartet Martina Dvořáka', ['concerts'], V.jazzDock, '2026-11-06T20:00:00+01:00', czk(350)),
  ev('e02', 'Hluboká noc: techno do rána', ['parties'], V.roxy, '2026-11-06T23:00:00+01:00', czk(300, 450)),
  ev('e03', 'Proměna', ['theatre'], V.archa, '2026-11-06T19:30:00+01:00', czk(290, 590)),
  ev('e04', 'Svátek světla', ['festivals', 'exhibitions'], V.vystaviste, '2026-09-23T10:00:00+02:00', czk(250), { endsAt: '2027-06-09T20:00:00+02:00' }),
  ev('e05', 'Animované kraťasy na Oku', ['film'], V.bioOko, '2026-11-06T20:30:00+01:00', czk(160)),
  ev('e06', 'Jak dýchají města: přednáška', ['other'], V.knihovna, '2026-11-06T18:00:00+01:00', FREE),
  ev('e07', 'Vltavín: akustické turné', ['concerts'], V.akropolis, '2026-11-06T20:00:00+01:00', czk(590), { status: 'soldOut' }),
  ev('e08', 'Hororový maraton', ['film'], V.aero, '2026-11-06T23:00:00+01:00', czk(260), { status: 'saleEnded' }),

  // Sobota 7. 11.
  ev('e09', 'Sobotní dopoledne pod hvězdami', ['kids'], V.planetarium, '2026-11-07T10:00:00+01:00', czk(120)),
  ev('e10', 'Labutí jezero', ['theatre'], V.narodni, '2026-11-07T19:00:00+01:00', czk(200, 1450)),
  ev('e11', 'Syntezátorová noc', ['concerts', 'parties'], V.meetFactory, '2026-11-07T21:00:00+01:00', czk(400)),
  ev('e12', 'Vinylový trh s DJs', ['festivals'], V.kasarna, '2026-11-07T12:00:00+01:00', FREE, { endsAt: '2026-11-07T22:00:00+01:00' }),
  ev('e13', 'Pohádky z kufru', ['kids', 'theatre'], V.minor, '2026-11-07T15:00:00+01:00', czk(180)),
  ev('e14', 'Komorní večer v Rudolfinu', ['concerts'], V.rudolfinum, '2026-11-07T19:30:00+01:00', czk(350, 1200)),
  ev('e15', 'Dechovka & Bass', ['parties'], V.crossClub, '2026-11-07T23:00:00+01:00', UNKNOWN),
  ev('e16', 'Severní světla: Arena Tour 2026', ['concerts'], V.o2, '2026-11-07T20:00:00+01:00', czk(1290, 2490)),

  // Neděle 8. 11.
  ev('e17', 'Nedělní jazz jam', ['concerts'], V.jazzDock, '2026-11-08T20:00:00+01:00', FREE),
  ev('e18', 'Rodinná neděle v DOXu', ['kids', 'exhibitions'], V.dox, '2026-11-08T10:00:00+01:00', czk(140), { endsAt: '2026-11-08T18:00:00+01:00' }),
  ev('e19', 'Improvizační souboj', ['theatre'], V.hrdinu, '2026-11-08T19:00:00+01:00', czk(250)),
  ev('e20', 'Řeky Šumavy: projekce a debata', ['film', 'other'], V.svetozor, '2026-11-08T18:00:00+01:00', czk(180)),
  ev('e30', 'Ochutnávka moravských vín', ['gastro'], V.trznice, '2026-11-08T16:00:00+01:00', czk(450)),
  ev('e31', 'Noční běh Stromovkou', ['sport'], V.stromovka, '2026-11-08T18:30:00+01:00', czk(390)),

  // Next week
  ev('e21', 'Hamlet (in English)', ['theatre'], V.svandovo, '2026-11-10T19:00:00+01:00', czk(390, 690), { status: 'soldOut' }),
  ev('e22', 'Poezie a pivo', ['other'], V.vagon, '2026-11-11T20:00:00+01:00', czk(80)),
  ev('e23', 'Pražské jazzové noci', ['festivals', 'concerts'], V.lucerna, '2026-11-13T18:00:00+01:00', czk(790, 2200), { endsAt: '2026-11-15T23:00:00+01:00' }),
  ev('e24', 'Robotická dílna pro děti', ['kids'], V.knihovna, '2026-11-14T10:00:00+01:00', FREE),
  ev('e25', 'Koncert ke 17. listopadu', ['concerts', 'festivals'], V.albertov, '2026-11-17T16:00:00+01:00', FREE),
  ev('e26', 'Drum & Bass Arena', ['parties'], V.forumKarlin, '2026-11-20T22:00:00+01:00', czk(690, 990)),

  // Ongoing exhibitions
  ev('e27', 'Český modernismus 1900–1939', ['exhibitions'], V.veletrzni, '2026-09-01T10:00:00+02:00', czk(250), { endsAt: '2027-02-28T18:00:00+01:00' }),
  ev('e28', 'Mladá fotografie 2026', ['exhibitions'], V.galerieRudolfinum, '2026-10-20T10:00:00+02:00', FREE, { endsAt: '2026-12-31T18:00:00+01:00' }),

  // Already over at DEMO_NOW: must never be shown
  ev('e29', 'Polední jazz na Smíchově', ['concerts'], V.jazzDock, '2026-11-06T12:30:00+01:00', czk(150)),
]
