// Kapitel 3: Meer und Angeln
export default {
  id: 'meer',
  title: 'Am Meer',
  icon: 'boot',
  tasks: [
    { id: 'meer-malen', text: 'Mal ein Meer aus zehn Feldern.', tip: 'Unter Wasser das Meer wählen und mit dem Finger malen.', on: 'gebaut', when: (d) => d.id === 'meer', count: 10 },
    { id: 'meer-boot', text: 'Setz ein Fischerboot ins Meer.', tip: 'Das Fischerboot findest du unter Wasser.', on: 'gebaut', when: (d) => d.id === 'boot' },
    { id: 'meer-einsteigen', text: 'Steig ins Fischerboot.', tip: 'Lauf ans Ufer zum Boot und tippe auf Einsteigen.', on: 'eingestiegen', when: (d) => d.type === 'boot' },
    { id: 'meer-fisch', text: 'Fang einen Fisch.', tip: 'Fahr zu einem Schatten im Wasser und tippe auf Angeln. Wenn es spritzt, schnell noch einmal tippen!', on: 'fang:geaendert', when: (d) => !!d.type },
    { id: 'meer-drei', text: 'Fang drei Fische.', tip: 'Im Meer gibt es andere Fische als im See.', on: 'fang:geaendert', when: (d) => !!d.type, count: 3 },
    { id: 'meer-aussetzen', text: 'Setz einen Fisch in einen See.', tip: 'Unter Fische einen Fisch wählen und ins Wasser tippen.', on: 'gebaut', when: (d) => d.kind === 'fish' },
  ],
};
