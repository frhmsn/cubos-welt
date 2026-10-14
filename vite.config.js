// Baut src/ zu einer einzigen HTML-Datei (dist/index.html).
// Daraus macht tools/build.mjs das Artifact und die App für den Home-Bildschirm.
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: 'src',
  base: './',
  plugins: [viteSingleFile()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: false,
    target: 'es2020',
    modulePreload: false,
    // Kein Tree-Shaking: Rollup würde sonst z. B. ungenutzte Math.random()-Aufrufe entfernen.
    // Das ändert den Zufallsstrom, und der Vergleich mit dem alten Stand wäre nicht mehr möglich.
    rollupOptions: { treeshake: false },
  },
  logLevel: 'warn',
});
