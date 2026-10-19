// Sanftes Konfetti zum Abschluss. Bei «Bewegung reduzieren» gibt es keines.
import { bewegungReduziert } from './ui.js';

const FARBEN = ['#F6B93B', '#E5383B', '#2F6FD0', '#2F8F46', '#8A4FC7', '#E8792B', '#F59DB2'];
const DAUER = 4000;

export function konfetti(anzahl = 140) {
  if (bewegungReduziert()) return;

  const flaeche = document.createElement('canvas');
  flaeche.className = 'konfetti';
  flaeche.setAttribute('aria-hidden', 'true');
  document.body.append(flaeche);
  const zeichnen = flaeche.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const breite = window.innerWidth;
  const hoehe = window.innerHeight;
  flaeche.width = breite * dpr;
  flaeche.height = hoehe * dpr;
  zeichnen.scale(dpr, dpr);

  const teile = Array.from({ length: anzahl }, () => ({
    x: Math.random() * breite,
    y: -20 - Math.random() * hoehe * 0.6,
    b: 8 + Math.random() * 8,
    h: 10 + Math.random() * 10,
    vy: 1.2 + Math.random() * 2,
    vx: (Math.random() - 0.5) * 1.2,
    drehung: Math.random() * Math.PI,
    dreh: (Math.random() - 0.5) * 0.15,
    phase: Math.random() * Math.PI * 2,
    farbe: FARBEN[Math.floor(Math.random() * FARBEN.length)],
  }));

  const start = performance.now();
  function bild(jetzt) {
    const vergangen = jetzt - start;
    zeichnen.clearRect(0, 0, breite, hoehe);
    // Gegen Ende sanft ausblenden
    zeichnen.globalAlpha = Math.min(1, (DAUER - vergangen) / 800);
    for (const t of teile) {
      t.y += t.vy;
      t.x += t.vx + Math.sin(vergangen / 400 + t.phase) * 0.6;
      t.drehung += t.dreh;
      zeichnen.save();
      zeichnen.translate(t.x, t.y);
      zeichnen.rotate(t.drehung);
      zeichnen.fillStyle = t.farbe;
      zeichnen.fillRect(-t.b / 2, -t.h / 2, t.b, t.h * Math.abs(Math.cos(t.drehung)));
      zeichnen.restore();
    }
    if (vergangen < DAUER) requestAnimationFrame(bild);
    else flaeche.remove();
  }
  requestAnimationFrame(bild);
}
