import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const apiTarget = process.env.VITE_API_URL ;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,        
    environment: 'jsdom', 
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      
      // 1. LA LIGNE MAGIQUE : Active le scan de tous les fichiers
      all: true, 
      
      // 2. FILTRES IMPORTANTS (Sinon il va scanner node_modules, les configs, etc.)
      include: ['src/**/*.{jsx,js,ts,tsx}'], // On ne regarde que le dossier src
      
      // 3. EXCLUSIONS (Fichiers qu'on ne veut pas tester)
      exclude: [
        'src/main.jsx',          // Point d'entrée (souvent exclu)
        'src/vite-env.d.ts',     // Types
        'src/**/*.test.{js,jsx}',// Les fichiers de tests eux-mêmes
        'src/**/index.{js,jsx}', // Souvent juste des exports (optionnel)
        '**/*.d.ts',             // Fichiers de définition TypeScript
      ],
    },
  },
  server: {
    port: 80,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
