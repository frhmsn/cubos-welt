// Kapitel 1: die ersten Schritte. Bonus: goldener Lamborghini.
// Aufgabe: { id, text (wird vorgelesen), tip (Hilfe im Buch), on (Ereignis aus core/events.js), when(d) (optional), count (optional) }
export default {
  id: 'stadt',
  title: 'Erste Stadt',
  icon: 'haus',
  bonus: { item: 'goldlambo', text: 'ein goldener Lamborghini' },
  tasks: [
    { id: 'stadt-strasse', text: 'Bau eine Straße aus drei Stücken.', tip: 'Tippe unten auf Land, dann auf Straße. Dann tippe dreimal nebeneinander in die Wiese.', on: 'gebaut', when: (d) => d.id === 'strasse', count: 3 },
    { id: 'stadt-haus', text: 'Bau ein Haus.', tip: 'Tippe unten auf Häuser und such dir ein Haus aus. Neben einer Straße zeigt die Tür zur Straße.', on: 'gebaut', when: (d) => ['haus', 'villa', 'hochhaus', 'feuerwache', 'garage'].includes(d.id) },
    { id: 'stadt-baum', text: 'Pflanz zwei Bäume.', tip: 'Unter Natur gibt es Bäume und Tannen.', on: 'gebaut', when: (d) => d.id === 'baum' || d.id === 'tanne', count: 2 },
    { id: 'stadt-auto', text: 'Stell ein Auto auf die Straße.', tip: 'Unter Autos ein Auto aussuchen und auf die Straße tippen.', on: 'gebaut', when: (d) => d.kind === 'car' && !['boot', 'uboot'].includes(d.id) },
    { id: 'stadt-laufen', text: 'Lauf selbst durch deine Stadt.', tip: 'Tippe oben rechts auf das Männchen.', on: 'modus', when: (d) => d.mode === 'walk' },
    { id: 'stadt-fahren', text: 'Steig in ein Auto und fahr los.', tip: 'Lauf zu einem Auto und tippe auf Einsteigen.', on: 'eingestiegen', when: (d) => !['boot', 'uboot'].includes(d.type) },
    { id: 'stadt-hupen', text: 'Drück im Auto auf die Hupe.', tip: 'Beim Fahren ist unten rechts der Hupen-Knopf.', on: 'hupen', when: (d) => d.mode === 'drive' },
  ],
};
