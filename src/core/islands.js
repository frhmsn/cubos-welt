// Insel-Regeln: Land ins Wasser malen, rundherum entsteht Strand.
// Reine Logik auf den Felddaten, ohne Grafik. Wird vom Insel-Pinsel und von der Inselwelt benutzt.
import { DIRS, inb } from './grid.js';
import { gAt } from './world-data.js';

const WATER = new Set(['meer', 'wasser']);
const LANDABLE = new Set(['meer', 'wasser', 'sand', 'gras']); // was der Pinsel umwandeln darf
const AROUND = [...DIRS, [1, 1], [1, -1], [-1, 1], [-1, -1]];

/**
 * Änderungen für einen Pinselstrich auf Feld (i, j): Mitte wird Wiese, angrenzendes Wasser wird Strand.
 * Straßen, Gleise, Anleger usw. bleiben unberührt. Rückgabe: [[i, j, boden], ...]
 */
function islandStroke(i, j) {
  const out = [];
  const g = gAt(i, j);
  if (g && LANDABLE.has(g) && g !== 'gras') out.push([i, j, 'gras']);
  for (const [di, dj] of AROUND) {
    const a = i + di, b = j + dj;
    if (inb(a, b) && WATER.has(gAt(a, b))) out.push([a, b, 'sand']);
  }
  return out;
}

export { islandStroke };
