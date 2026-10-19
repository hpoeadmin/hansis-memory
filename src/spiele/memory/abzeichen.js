// Abzeichen für einen vollständig gesammelten Satz: Medaille mit Bändern.
import { el } from '../../kern/ui.js';
import { bildUrl } from './sets.js';
import { T } from '../../texte.js';

export function abzeichen(set, gross = false) {
  return el(
    'div',
    { class: `abzeichen ${gross ? 'gross' : ''}`.trim(), style: `--set-farbe: ${set.farbe}` },
    el(
      'div',
      { class: 'medaille' },
      el('span', { class: 'band links', 'aria-hidden': 'true' }),
      el('span', { class: 'band rechts', 'aria-hidden': 'true' }),
      el(
        'span',
        { class: 'medaille-rund' },
        set.titelbild ? el('img', { src: bildUrl(set, set.titelbild), alt: '' }) : null,
      ),
    ),
    el('span', { class: 'abzeichen-text' }, T.album.abzeichenText(set.name)),
  );
}
