// Kapitel 4: Entdecker
export default {
  id: 'entdecker',
  title: 'Entdecker',
  icon: 'uboot',
  tasks: [
    { id: 'entd-uboot', text: 'Steig in ein U-Boot.', tip: 'Das U-Boot findest du unter Wasser. Es braucht Meer.', on: 'eingestiegen', when: (d) => d.type === 'uboot' },
    { id: 'entd-tauchen', text: 'Tauch mit dem U-Boot ab.', tip: 'Im U-Boot unten rechts auf Abtauchen tippen.', on: 'tauchen' },
    { id: 'entd-wal', text: 'Entdecke einen Wal.', tip: 'Wale leben in einem großen Meer. Halte Ausschau nach der Fontäne!', on: 'wal:gesehen' },
    { id: 'entd-aquarium', text: 'Bau ein Aquarium.', tip: 'Unter Häuser ist das Aquarium. Es braucht drei mal drei Felder.', on: 'gebaut', when: (d) => d.id === 'aquarium' },
    { id: 'entd-hinein', text: 'Geh ins Aquarium hinein.', tip: 'Lauf mit dem Männchen durch die Tür.', on: 'aquarium:betreten' },
    { id: 'entd-nacht', text: 'Mach es Nacht.', tip: 'Oben rechts auf die Sonne tippen.', on: 'tageszeit', when: (d) => d.nacht },
    { id: 'entd-werkstatt', text: 'Bau ein Haus Stein für Stein.', tip: 'Unter Häuser auf Selbst bauen tippen, dann auf die Wiese.', on: 'werkstatt:fertig' },
  ],
};
