import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige, bestaetigen } from '../../kern/ui.js';
import { avatarUrl, farbStil } from '../../kern/profile.js';
import { klang } from '../../kern/klang.js';
import { sprich } from '../../kern/vorlesen.js';
import { anzahl, fuehreAus, phase, wegnehmbare, zieleVon } from './regeln.js';
import { waehleZug } from './computer.js';
import { zeichneBrett } from './brett.js';

const DENKPAUSE = 900; // ms, damit man den Zug des Tablets mitverfolgen kann
const MAX_VERLAUF = 80;

export function zeigeSpiel(n) {
  const N = T.nuenistei;
  const partie = n.partie;
  const spieler = partie.spielerIds.map(n.profilVon);
  const istComputer = (seite) => Boolean(spieler[seite].computer);
  const zuZweit = !spieler.some((s) => s.computer);

  let gewaehlt = null;
  let zuletzt = null;
  let tabletDenkt = false;
  let hinweis = null;
  let beendet = false;

  const meldung = el('div', { class: 'meldung', role: 'status', 'aria-live': 'polite' });
  const seiten = [el('aside', { class: 'muehle-seite links' }), el('aside', { class: 'muehle-seite rechts' })];
  const brettBox = el('div', { class: 'muehle-mitte' });
  const zurueckKnopf = knopf(N.zugZurueck, zugZurueck, 'knopf-zug-zurueck');
  const beendenKnopf = knopf(T.spiel.beenden, beenden, 'knopf-beenden');

  // ---------- Anzeige ----------

  function meldungstext(z) {
    const name = spieler[z.amZug].name;
    if (tabletDenkt) return N.tabletDenkt;
    if (z.wegnehmen) return N.muehle(name, spieler[1 - z.amZug].name);
    if (hinweis) return hinweis;
    const p = phase(z);
    if (p === 'setzen') return N.setzen(name);
    if (gewaehlt !== null) return N.ziel;
    return p === 'springen' ? N.springenWaehlen(name) : N.waehlen(name);
  }

  function seitenfeld(seite, z) {
    const profil = spieler[seite];
    const aktiv = z.amZug === seite && z.sieger === null;
    const zuSetzen = z.zuSetzen[seite];
    const box = seiten[seite];
    box.className = `muehle-seite ${seite === 0 ? 'links' : 'rechts'} ${aktiv ? 'aktiv' : ''}`;
    box.style.cssText = farbStil(profil);
    const inhalt = [
      aktiv ? el('span', { class: 'dran-schild' }, N.istDran) : null,
      el('img', { class: 'avatar', src: avatarUrl(profil), alt: '' }),
      el('span', { class: 'seite-name' }, profil.name),
      el(
        'span',
        { class: 'seite-farbe' },
        el('span', { class: `mini-stein ${seite === 0 ? 'weiss' : 'schwarz'}`, 'aria-hidden': 'true' }),
        seite === 0 ? N.weiss : N.schwarz,
      ),
      el('span', { class: 'seite-text' }, zuSetzen > 0 ? N.nochZuSetzen(zuSetzen) : N.alleGesetzt),
      el('span', { class: 'seite-text' }, N.aufDemBrett(anzahl(z, seite))),
      zuSetzen === 0 && phase(z, seite) === 'springen' ? el('span', { class: 'seite-text fett' }, N.darfSpringen) : null,
      el(
        'span',
        { class: 'vorrat', 'aria-hidden': 'true' },
        Array.from({ length: zuSetzen }, () => el('span', { class: `mini-stein ${seite === 0 ? 'weiss' : 'schwarz'}` })),
      ),
    ];
    box.replaceChildren(...inhalt.filter(Boolean));
  }

  function zeichne() {
    const z = partie.zustand;
    meldung.textContent = meldungstext(z);
    meldung.classList.toggle('muehle', z.wegnehmen);

    seitenfeld(0, z);
    seitenfeld(1, z);

    const mensch = !istComputer(z.amZug) && !tabletDenkt;
    let beweglich = [];
    if (mensch && !z.wegnehmen && gewaehlt === null && phase(z) !== 'setzen') {
      z.brett.forEach((s, p) => s === z.amZug && zieleVon(z, p).length && beweglich.push(p));
    }
    brettBox.replaceChildren(
      zeichneBrett(
        {
          brett: z.brett,
          gewaehlt,
          ziele: gewaehlt !== null ? zieleVon(z, gewaehlt) : [],
          wegnehmbar: z.wegnehmen ? wegnehmbare(z) : [],
          muehle: z.letzteMuehle,
          beweglich,
          zuletzt,
        },
        (element, punkt) => beiTipp(element, () => tippe(punkt), { sperrzeit: 250 }),
      ),
    );

    const zurueckMoeglich = partie.verlauf.some((s) => !istComputer(s.amZug)) && !tabletDenkt;
    zurueckKnopf.hidden = n.einstellungen.zugZurueck === false;
    zurueckKnopf.classList.toggle('inaktiv', !zurueckMoeglich);
  }

  // ---------- Bedienung ----------

  function tippe(punkt) {
    const z = partie.zustand;
    if (beendet || tabletDenkt || z.sieger !== null || istComputer(z.amZug)) return;
    hinweis = null;

    if (z.wegnehmen) {
      if (wegnehmbare(z).includes(punkt)) spiele({ art: 'weg', punkt });
      return;
    }
    if (phase(z) === 'setzen') {
      if (z.brett[punkt] === null) spiele({ art: 'setzen', nach: punkt });
      return;
    }
    if (z.brett[punkt] === z.amZug) {
      gewaehlt = gewaehlt === punkt ? null : punkt;
      if (gewaehlt !== null && zieleVon(z, gewaehlt).length === 0) {
        gewaehlt = null;
        hinweis = N.keinZiel;
      }
      zuletzt = null;
      zeichne();
      return;
    }
    if (gewaehlt !== null && zieleVon(z, gewaehlt).includes(punkt)) {
      spiele({ art: 'ziehen', von: gewaehlt, nach: punkt });
    }
  }

  function spiele(zug) {
    const vorher = partie.zustand;
    const neu = fuehreAus(vorher, zug);
    partie.verlauf.push(vorher);
    if (partie.verlauf.length > MAX_VERLAUF) partie.verlauf.shift();
    partie.zustand = neu;
    zuletzt = { ...zug, seite: zug.art === 'weg' ? vorher.brett[zug.punkt] : vorher.amZug };
    gewaehlt = null;

    if (neu.wegnehmen) {
      klang.paar();
      sprich(N.muehleKurz);
    } else {
      klang.umdrehen();
      if (zuZweit && neu.amZug !== vorher.amZug && neu.sieger === null) setTimeout(klang.wechsel, 250);
    }
    n.speichere();
    zeichne();

    if (neu.sieger !== null) {
      beendet = true;
      setTimeout(n.spielFertig, 1600);
      return;
    }
    computerZug();
  }

  function computerZug() {
    const z = partie.zustand;
    if (beendet || z.sieger !== null || !istComputer(z.amZug)) return;
    tabletDenkt = true;
    zeichne();
    setTimeout(() => {
      if (beendet) return;
      const zug = waehleZug(partie.zustand, partie.modus.stufe);
      tabletDenkt = false;
      spiele(zug);
    }, DENKPAUSE);
  }

  function zugZurueck() {
    if (tabletDenkt || n.einstellungen.zugZurueck === false) return;
    const verlauf = partie.verlauf;
    // Gegen das Tablet: bis zum letzten eigenen Zug zurück
    let ziel = null;
    while (verlauf.length) {
      ziel = verlauf.pop();
      if (!istComputer(ziel.amZug)) break;
    }
    if (!ziel) return;
    partie.zustand = ziel;
    gewaehlt = null;
    zuletzt = null;
    hinweis = null;
    n.speichere();
    zeichne();
    computerZug();
  }

  async function beenden() {
    const ja = await bestaetigen(N.beendenFrage, T.spiel.beendenJa, T.spiel.beendenNein);
    if (ja) {
      beendet = true;
      n.speichere();
      n.zeigeStart();
    }
  }

  zeige(
    el(
      'main',
      { class: 'bildschirm muehle-spiel', style: '--set-farbe: #EAD7B7' },
      meldung,
      seiten[0],
      brettBox,
      seiten[1],
      el('footer', { class: 'muehle-fuss' }, zurueckKnopf, beendenKnopf),
    ),
  );
  zeichne();
  computerZug();
}
