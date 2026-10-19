// Kleine Hilfsfunktionen für die Oberfläche.

export function el(tag, eigenschaften = {}, ...kinder) {
  const element = document.createElement(tag);
  for (const [name, wert] of Object.entries(eigenschaften)) {
    if (name === 'class') element.className = wert;
    else if (name === 'style') element.style.cssText = wert;
    else if (name.startsWith('on')) element.addEventListener(name.slice(2), wert);
    else if (wert !== false && wert != null) element.setAttribute(name, wert);
  }
  for (const kind of kinder.flat()) {
    if (kind == null || kind === false) continue;
    element.append(kind instanceof Node ? kind : document.createTextNode(kind));
  }
  return element;
}

// Ein Tipp löst sofort beim Berühren aus. Lange oder zittrige Berührungen
// zählen nur einmal; weitere Tipps kurz danach werden ignoriert.
// In Listen, die man scrollen kann (scrollbar: true), zählt der Tipp erst beim
// Loslassen – und nur, wenn der Finger nicht zum Scrollen bewegt wurde.
const MAX_BEWEGUNG = 24; // px, Zittern bis zu dieser Strecke zählt noch als Tipp

export function beiTipp(element, aktion, { sperrzeit = 350, scrollbar = false } = {}) {
  let letzter = 0;
  const ausloesen = (ereignis) => {
    const jetzt = performance.now();
    if (jetzt - letzter < sperrzeit) return;
    letzter = jetzt;
    aktion(ereignis);
  };

  if (scrollbar) {
    let start = null;
    element.addEventListener('pointerdown', (ereignis) => {
      if (ereignis.button > 0) return;
      start = { x: ereignis.clientX, y: ereignis.clientY, id: ereignis.pointerId };
    });
    element.addEventListener('pointercancel', () => (start = null));
    element.addEventListener('pointerup', (ereignis) => {
      if (!start || start.id !== ereignis.pointerId) return;
      const weg = Math.hypot(ereignis.clientX - start.x, ereignis.clientY - start.y);
      start = null;
      if (weg <= MAX_BEWEGUNG) ausloesen(ereignis);
    });
  } else {
    element.addEventListener('pointerdown', (ereignis) => {
      if (ereignis.button > 0) return;
      ereignis.preventDefault();
      ausloesen(ereignis);
    });
  }
  // Tastatur (z.B. Bluetooth-Tastatur oder Bedienungshilfen)
  element.addEventListener('keydown', (ereignis) => {
    if (ereignis.key === 'Enter' || ereignis.key === ' ') {
      ereignis.preventDefault();
      ausloesen(ereignis);
    }
  });
  element.addEventListener('contextmenu', (ereignis) => ereignis.preventDefault());
}

export function knopf(text, aktion, klasse = '') {
  const k = el('button', { class: `knopf ${klasse}`.trim(), type: 'button' }, text);
  beiTipp(k, aktion);
  return k;
}

export function zeige(...inhalt) {
  const app = document.getElementById('app');
  app.replaceChildren(...inhalt);
  window.scrollTo(0, 0);
}

export function bestaetigen(frage, jaText, neinText) {
  return new Promise((erledigt) => {
    const schliessen = (antwort) => {
      hintergrund.remove();
      erledigt(antwort);
    };
    const hintergrund = el(
      'div',
      { class: 'dialog-hintergrund', role: 'dialog', 'aria-modal': 'true' },
      el(
        'div',
        { class: 'dialog' },
        el('p', { class: 'dialog-frage' }, frage),
        el(
          'div',
          { class: 'dialog-knoepfe' },
          knopf(neinText, () => schliessen(false), 'knopf-haupt'),
          knopf(jaText, () => schliessen(true), 'knopf-neben'),
        ),
      ),
    );
    document.body.append(hintergrund);
  });
}

export function mischen(liste) {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

export function warte(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export const bewegungReduziert = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
