import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { filterKatexFonts } from './src/lib/katexFontTransform';

function katexWoff2Only() {
  return {
    name: 'katex-woff2-only',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      const idTanpaQuery = id.replace(/\\/g, '/').split('?')[0];
      if (!idTanpaQuery.includes('/katex/') || !idTanpaQuery.endsWith('.css')) return null;
      const transformed = filterKatexFonts(code);
      return transformed === code ? null : { code: transformed, map: null };
    }
  };
}

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/katex')) return 'katex';
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler')
          ) {
            return 'react';
          }
        }
      }
    }
  },
  plugins: [
    react(),
    katexWoff2Only(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Simulasi Lingkaran SMP',
        short_name: 'Lingkaran SMP',
        description: 'Simulasi interaktif lingkaran untuk Matematika SMP kelas 9.',
        lang: 'id-ID',
        start_url: './',
        display: 'standalone',
        background_color: '#f0f5fa',
        theme_color: '#123e6d',
        scope: './',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}', '**/*.woff2']
      }
    })
  ]
});
