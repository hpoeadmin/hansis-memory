import { T } from '../../texte.js';
import { el, beiTipp, knopf, zeige } from '../ui.js';
import { FARBEN, avatarUrl, speichereProfil } from '../profile.js';
import { KLASSEN, aktuelleKlasse, schuljahr } from '../schulstufe.js';

// Profil anlegen oder ändern. «fertig» wird nach Speichern oder Abbrechen aufgerufen.
export function zeigeProfil(app, profil, fertig) {
  const avatarSet = app.sets.find((s) => s.id === 'bauernhof');
  const entwurf = profil
    ? { ...profil }
    : { name: '', farbe: FARBEN[0].id, avatar: `${avatarSet.ordner}/${avatarSet.tiere[0].bild}` };

  const nameFeld = el('input', {
    class: 'name-feld',
    type: 'text',
    value: entwurf.name,
    maxlength: '14',
    autocomplete: 'off',
    autocapitalize: 'words',
    spellcheck: 'false',
    placeholder: T.profil.namePlatzhalter,
    'aria-label': T.profil.name,
  });
  const fehler = el('p', { class: 'fehler', role: 'alert' });

  const farbKnoepfe = FARBEN.map((farbe) => {
    const k = el(
      'button',
      {
        class: 'farb-knopf',
        type: 'button',
        style: `--spieler-farbe: ${farbe.wert}; --spieler-text: ${farbe.text}`,
      },
      el('span', { class: 'farb-punkt', 'aria-hidden': 'true' }),
      el('span', {}, T.profil.farben[farbe.id]),
    );
    beiTipp(k, () => {
      entwurf.farbe = farbe.id;
      aktualisiere();
    }, { scrollbar: true });
    return { id: farbe.id, k };
  });

  const avatarKnoepfe = avatarSet.tiere.map((tier) => {
    const pfad = `${avatarSet.ordner}/${tier.bild}`;
    const k = el(
      'button',
      { class: 'avatar-knopf', type: 'button', 'aria-label': tier.name },
      el('img', { src: avatarUrl({ avatar: pfad }), alt: '' }),
    );
    beiTipp(k, () => {
      entwurf.avatar = pfad;
      aktualisiere();
    }, { scrollbar: true });
    return { pfad, k };
  });

  // Klasse: gezeigt wird die heutige (mitgezählte) Klasse
  entwurf.klasse = aktuelleKlasse(profil)?.id ?? null;
  const klassenKnoepfe = [{ id: null }, ...KLASSEN].map(({ id }) => {
    const k = el(
      'button',
      { class: 'wahl-knopf klasse-knopf', type: 'button' },
      el('span', {}, id ? T.schule.klassen[id] : T.schule.keine),
    );
    beiTipp(k, () => {
      entwurf.klasse = id;
      aktualisiere();
    }, { scrollbar: true });
    return { id, k };
  });

  function aktualisiere() {
    for (const { id, k } of klassenKnoepfe) {
      k.classList.toggle('gewaehlt', id === entwurf.klasse);
      k.setAttribute('aria-pressed', id === entwurf.klasse ? 'true' : 'false');
    }
    for (const { id, k } of farbKnoepfe) {
      k.classList.toggle('gewaehlt', id === entwurf.farbe);
      k.setAttribute('aria-pressed', id === entwurf.farbe ? 'true' : 'false');
    }
    for (const { pfad, k } of avatarKnoepfe) {
      k.classList.toggle('gewaehlt', pfad === entwurf.avatar);
      k.setAttribute('aria-pressed', pfad === entwurf.avatar ? 'true' : 'false');
    }
  }
  aktualisiere();

  function speichern() {
    const name = nameFeld.value.trim();
    if (!name) {
      fehler.textContent = T.profil.nameFehlt;
      nameFeld.focus();
      return;
    }
    entwurf.name = name;
    // Die Klasse gilt ab dem laufenden Schuljahr und zählt von da an mit
    if (entwurf.klasse) entwurf.klasseSchuljahr = schuljahr();
    else delete entwurf.klasseSchuljahr;
    fertig(speichereProfil(entwurf));
  }

  // Das Namensfeld braucht den normalen Fokus, darum hier kein beiTipp
  nameFeld.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') nameFeld.blur();
  });

  zeige(
    el(
      'main',
      { class: 'bildschirm profil' },
      el(
        'header',
        { class: 'kopfzeile' },
        el('h1', { class: 'kopf-titel' }, profil ? T.profil.titelAendern : T.profil.titelNeu),
      ),
      el(
        'div',
        { class: 'profil-inhalt' },
        el('label', { class: 'feld-titel' }, T.profil.name, nameFeld),
        fehler,
        el('h2', { class: 'feld-titel' }, T.profil.farbe),
        el('div', { class: 'farb-liste' }, farbKnoepfe.map((f) => f.k)),
        el('h2', { class: 'feld-titel' }, T.profil.tier),
        el('div', { class: 'avatar-liste' }, avatarKnoepfe.map((a) => a.k)),
        el('h2', { class: 'feld-titel' }, T.schule.titel),
        el('p', { class: 'hinweis' }, T.schule.hinweis),
        el('div', { class: 'wahl-liste klassen-liste' }, klassenKnoepfe.map((x) => x.k)),
      ),
      el(
        'footer',
        { class: 'fusszeile' },
        knopf(T.profil.abbrechen, () => fertig(null), 'knopf-neben'),
        knopf(T.profil.speichern, speichern, 'knopf-haupt'),
      ),
    ),
  );
}
