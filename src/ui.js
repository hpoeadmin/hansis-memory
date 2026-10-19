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
export function beiTipp(element, aktion, sperrzeit = 350) {
  let letzter = 0;
  element.addEventListener('pointerdown', (ereignis) => {
    if (ereignis.button > 0) return;
    ereignis.preventDefault();
    const jetzt = performance.now();
    if (jetzt - letzter < sperrzeit) return;
    letzter = jetzt;
    aktion(ereignis);
  });
  // Tastatur (z.B. Bluetooth-Tastatur oder Bedienungshilfen)
  element.addEventListener('keydown', (ereignis) => {
    if (ereignis.key === 'Enter' || ereignis.key === ' ') {
      ereignis.preventDefault();
      aktion(ereignis);
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
