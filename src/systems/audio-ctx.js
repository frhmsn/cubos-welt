// Der eine AudioContext für Töne und Vorlesen. Blatt-Modul ohne Abhängigkeiten.
// iOS startet ihn erst nach einer Berührung; ac() bei jedem Antippen aufrufen weckt ihn auf.
let AC = null;
function ac() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
export { ac };
