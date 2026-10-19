// Elternschloss: Knopf, der 3 Sekunden gedrückt gehalten werden muss.
// Ein Balken im Knopf zeigt, wie lange es noch dauert.
import { T } from '../texte.js';
import { el } from './ui.js';

const HALTEDAUER = 3000;

export function elternschloss(oeffnen) {
  const fuellung = el('span', { class: 'schloss-fuellung', 'aria-hidden': 'true' });
  const hinweis = el('span', { class: 'schloss-hinweis', role: 'status' });
  const knopf = el(
    'button',
    { class: 'knopf knopf-schloss', type: 'button', 'aria-describedby': 'schloss-hinweis' },
    fuellung,
    el('span', { class: 'schloss-text' }, T.schloss.knopf),
  );
  hinweis.id = 'schloss-hinweis';

  let zeit = null;
  let hinweisZeit = null;

  const abbrechen = () => {
    if (!zeit) return;
    clearTimeout(zeit);
    zeit = null;
    knopf.classList.remove('haelt');
    // Kurz getippt: erklären, wie es geht
    hinweis.textContent = T.schloss.halten;
    clearTimeout(hinweisZeit);
    hinweisZeit = setTimeout(() => (hinweis.textContent = ''), 4000);
  };

  knopf.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    e.preventDefault();
    knopf.setPointerCapture?.(e.pointerId);
    knopf.classList.add('haelt');
    hinweis.textContent = '';
    zeit = setTimeout(() => {
      zeit = null;
      knopf.classList.remove('haelt');
      oeffnen();
    }, HALTEDAUER);
  });
  knopf.addEventListener('pointerup', abbrechen);
  knopf.addEventListener('pointercancel', abbrechen);
  knopf.addEventListener('contextmenu', (e) => e.preventDefault());

  return el('div', { class: 'schloss' }, knopf, hinweis);
}
