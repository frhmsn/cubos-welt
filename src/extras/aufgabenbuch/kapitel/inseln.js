// Kapitel 5: Inselwelt
export default {
  id: 'inseln',
  title: 'Inselwelt',
  icon: 'faehre',
  tasks: [
    { id: 'insel-pinsel', text: 'Mal eine Insel ins Meer.', tip: 'Mit dem Insel-Pinsel ins Meer malen. Der Strand kommt von allein.', on: 'insel:gemalt', count: 6 },
    { id: 'insel-anleger', text: 'Bau einen Anleger am Ufer.', tip: 'Den Anleger ins Wasser direkt neben das Land setzen.', on: 'gebaut', when: (d) => d.id === 'anleger' },
    { id: 'insel-faehre', text: 'Setz eine Fähre ins Wasser.', tip: 'Die Fähre fährt von Anleger zu Anleger.', on: 'gebaut', when: (d) => d.id === 'faehre' },
    { id: 'insel-reise', text: 'Reise in eine andere Welt.', tip: 'Fahr mit der Fähre durch das Seetor oder mit dem Zug durch den Tunnel.', on: 'reise' },
    { id: 'insel-speichern', text: 'Speichere deine Welt.', tip: 'Oben rechts auf die Wolke tippen.', on: 'welt:gespeichert' },
  ],
};
