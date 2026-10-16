// Kapitel 2: Eisenbahn
export default {
  id: 'bahn',
  title: 'Eisenbahn',
  icon: 'zug',
  tasks: [
    { id: 'bahn-gleis', text: 'Bau ein Gleis aus fünf Stücken.', tip: 'Unter Bahn findest du das Gleis. Du kannst mit dem Finger malen.', on: 'gebaut', when: (d) => d.id === 'schiene', count: 5 },
    { id: 'bahn-bahnhof', text: 'Bau einen Bahnhof auf das Gleis.', tip: 'Den Bahnhof direkt auf ein Gleis-Stück setzen.', on: 'gebaut', when: (d) => d.id === 'bahnhof' },
    { id: 'bahn-zug', text: 'Stell einen Zug auf das Gleis.', tip: 'Regionalzug oder Schnellzug auf ein Gleis tippen.', on: 'gebaut', when: (d) => d.kind === 'train' },
    { id: 'bahn-mitfahren', text: 'Fahr mit dem Zug mit.', tip: 'Lauf zum Bahnhof. Wenn der Zug hält, tippe auf Einsteigen.', on: 'mitfahren' },
    { id: 'bahn-pfeifen', text: 'Lass den Zug pfeifen.', tip: 'Im Zug unten rechts auf Pfeifen tippen.', on: 'hupen', when: (d) => d.mode === 'ride' },
  ],
};
