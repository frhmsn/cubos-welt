// Blickpunkt: die Stelle, auf die Kamera oder Spielfigur gerade schaut.
// Die Spielschleife setzt ihn jedes Bild. Systeme sparen Arbeit für Dinge, die weit weg sind.
const focus=new THREE.Vector3();
/** Liegt (x, z) näher als r am Blickpunkt? */
function nearFocus(x,z,r){return (x-focus.x)**2+(z-focus.z)**2<r*r;}

export { focus, nearFocus };
