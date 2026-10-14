// Das Feld-Raster der Welt: Feldgröße, Weltgröße, Umrechnung Feld <-> Weltkoordinate, Richtungen.
import { game } from './state.js';

const TILE=4, START_N=20, MAX_N=60, GROW=5;
game.N = START_N; game.HALF = game.N*TILE/2;
const ZMAX=()=>Math.max(95,game.N*TILE*.8);
const DIRS=[[0,1],[1,0],[0,-1],[-1,0]];
const I=(i,j)=>j*game.N+i;
const inb=(i,j)=>i>=0&&j>=0&&i<game.N&&j<game.N;
const center=(i,j)=>({x:(i+.5)*TILE-game.HALF, z:(j+.5)*TILE-game.HALF});
const tileAt=(x,z)=>{const i=Math.floor((x+game.HALF)/TILE), j=Math.floor((z+game.HALF)/TILE); return inb(i,j)?{i,j}:null;};
const rightOf=d=>{const f=DIRS[d]; return [-f[1],f[0]];};

export { DIRS, GROW, I, MAX_N, START_N, TILE, ZMAX, center, inb, rightOf, tileAt };
