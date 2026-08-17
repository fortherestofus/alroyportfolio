/**
 * Where the work has shown up — press, programmes and exhibitions
 * (section 01, closing block).
 *
 * Not a logo wall, deliberately. Section 01 already ends on the client
 * marquee, and a second row of marks inches above it would read as the
 * same proof twice. More importantly, only one of these three is a
 * recognisable mark: a strip of logos would lean on GQ and let the
 * other two pass as press coverage they are not.
 *
 * So each entry says what it actually was, and `kind` carries the
 * distinction plainly. One is an article Alroy wrote. One is a national
 * programme he helped design and built the platform for. One is an
 * exhibition his work appeared in, covered by a paper that does not
 * name him. Calling all three "featured in" would be the one
 * overclaiming line on a site whose whole argument is that it does not
 * do that.
 *
 * Every line below was checked against the linked page rather than
 * written from memory.
 */
export interface Feature {
  /** The publication, programme or institution. */
  outlet: string;
  /** What kind of thing this is. See the note above — this is load bearing. */
  kind: string;
  year: string;
  /** One line on what it actually was, in Alroy's own voice, for the page. */
  what: string;
  /**
   * The same line in third person, for llms.txt.
   *
   * Not duplication for its own sake. That file is written as "Alroy
   * Ndhlovu is…" so an engine can lift a sentence out of it intact, and
   * it says so in its own header — dropping "I built the platform" into
   * it hands the engine two voices and produces answers that switch
   * person mid-sentence. Same fact, stated once for a reader and once
   * for a machine.
   */
  thirdPerson: string;
  href: string;
}

export const FEATURES: Feature[] = [
  {
    outlet: "GQ South Africa",
    kind: "Bylined article",
    year: "2025",
    what: "Wrote the piece on branding as a business's extroversion — the principles that carried across four brands of my own, for readers who are not natural extroverts.",
    thirdPerson:
      "Wrote the GQ South Africa piece on branding as a business's extroversion, drawing on the four brands he runs himself.",
    href: "https://gq.co.za/wealth/career-advice/2025-08-14-how-to-build-a-brand-that-truly-connects/",
  },
  {
    outlet: "We Are Victoria Falls",
    kind: "National programme",
    year: "2022–23",
    what: "One of three specialists who designed Let's Get Digital, Zimbabwe's tourism upskilling programme, with the Ministry of Tourism and the World Bank Group. I built the platform holding the courses and recordings.",
    thirdPerson:
      "One of three digital specialists who designed Let's Get Digital, Zimbabwe's national tourism upskilling programme, run with the Ministry of Tourism and Hospitality Industry and supported by the World Bank Group. He also built the learning platform holding its courses and recordings.",
    href: "https://wearevictoriafalls.com/training/",
  },
  {
    outlet: "Julie Miller Investment Art Institute",
    kind: "Exhibition",
    year: "2019",
    what: "A piece of mine shown at Africa's Art Collective Seasons, Mall of Africa — 500+ works by 130 African artists, toured in VR so international buyers could walk it remotely.",
    thirdPerson:
      "Had a work shown at Africa's Art Collective Seasons at the Mall of Africa, an exhibition of more than 500 pieces by 130 African artists that was toured in VR for international buyers.",
    href: "https://www.citizen.co.za/fourways-review/news-headlines/2019/03/20/mall-africa-julie-miller-investment-art-institute-smash-distance-barriers-name-art/",
  },
];
