// Gemeinsamer, veränderlicher Spielzustand.
// Hier liegen nur Werte, die mehrere Module lesen UND neu setzen. Werte, die nur ein Modul
// ändert, bleiben dort als normale Variable. Neues Feld: hier mit Startwert und Kommentar eintragen.

export const game = {
  // ---------- Modus und Steuerung ----------
  mode: 'build',     // 'build' (Bauen), 'walk' (Laufen), 'drive' (Fahren), 'ride' (Mitfahren), 'edit' (Bauwerkstatt)
  driveCar: null,    // Fahrzeug, das gerade gesteuert wird
  rideTrain: null,   // Zug, in dem man mitfährt
  traveling: null,   // laufende Reise in eine andere Welt
  stState: '',       // was das Bahnhof-Panel gerade zeigt
  gest: null,        // laufende Touch-Geste im Baumodus (Zoomen, Drehen)

  // ---------- Bauen ----------
  sel: 'hand',       // ausgewähltes Ding im Inventar (ID aus content/catalog.js)
  curCat: 'land',    // offene Inventar-Kategorie
  dirty: false,      // Welt geändert, Autosave steht aus

  // ---------- Tag und Nacht ----------
  dayT: .36,         // Tageszeit 0..1 (0,5 = Mittag)
  dayTarget: null,   // Ziel-Tageszeit beim Umschalten per Knopf

  // ---------- Unter Wasser ----------
  wasUnder: false,   // war die Kamera im letzten Bild unter Wasser

  // ---------- Meine Welten ----------
  curWorld: null,    // ID der geöffneten Welt (core/storage.js liest sie beim Start)
  worldDirty: false, // geöffnete Welt hat ungespeicherte Änderungen
  saving: false,     // Speichern läuft gerade
  worldCache: [],    // zuletzt geladene Welten-Liste fürs Menü

  // ---------- Beim Start von anderen Modulen gesetzt ----------
  N: 0,              // Kantenlänge der Welt in Feldern (core/grid.js)
  HALF: 0,           // halbe Weltbreite in Einheiten (core/grid.js)
  cam: null,         // aktive Kamera (render/renderer.js)
  dpr: 1,            // Auflösungsfaktor (render/renderer.js, core/loop.js passt ihn an)
  dprLock: false,    // Auflösung nicht mehr automatisch ändern
};

/** Spielfigur: Position (x, z), Blickrichtung (yaw, pitch) und Wippen beim Laufen. */
export const pl = {x:0,z:0,yaw:0,pitch:0,bob:0};
