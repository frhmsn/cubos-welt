// Gemeinsamer, veränderlicher Spielzustand.
// Hier liegen Werte, die mehrere Module neu setzen (z. B. der aktuelle Modus).
// Werte, die nur ein Modul ändert, bleiben dort als normale Variable.
// Die Startwerte setzt jeweils das Modul, aus dem der Wert stammt.
/**
 * Felder:
 *   HALF  (früher in core/grid.js)
 *   N  (früher in core/grid.js)
 *   aqShown  (früher in systems/aquarium.js)
 *   cam  (früher in render/renderer.js)
 *   curCat  (früher in systems/build.js)
 *   curWorld  (früher in core/storage.js)
 *   dayT  (früher in render/daynight.js)
 *   dayTarget  (früher in render/daynight.js)
 *   dirty  (früher in systems/build.js)
 *   dpr  (früher in render/renderer.js)
 *   dprLock  (früher in render/renderer.js)
 *   driveCar  (früher in systems/player.js)
 *   gest  (früher in ui/build-input.js)
 *   mode  (früher in systems/player.js)
 *   rideTrain  (früher in systems/trains.js)
 *   saving  (früher in core/storage.js)
 *   sel  (früher in systems/build.js)
 *   stState  (früher in ui/station-panel.js)
 *   traveling  (früher in systems/trains.js)
 *   wasUnder  (früher in systems/underwater.js)
 *   worldCache  (früher in core/storage.js)
 *   worldDirty  (früher in core/storage.js)
 */
export const game = {};
