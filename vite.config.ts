import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, type Plugin } from 'vite';

/**
 * Custom HTML Partials Plugin for Vite.
 * Resolves <!-- @include 'src/views/...' --> and <include src="..." />
 * both in dev server and production builds.
 */
function htmlPartialsPlugin(): Plugin {
  return {
    name: 'html-partials-plugin',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const rootDir = process.cwd();
        const includeRegex = /<!--\s*@include\s+['"]([^'"]+)['"]\s*-->|<include\s+src=['"]([^'"]+)['"]\s*\/?>/g;
        let result = html;
        let depth = 0;
        while (includeRegex.test(result) && depth < 10) {
          depth++;
          result = result.replace(includeRegex, (_match, p1, p2) => {
            const relPath = p1 || p2;
            const fullPath = path.resolve(rootDir, relPath);
            if (fs.existsSync(fullPath)) {
              return fs.readFileSync(fullPath, 'utf-8');
            }
            console.warn(`[html-partials-plugin] Partial file not found: ${fullPath}`);
            return `<!-- Partial not found: ${relPath} -->`;
          });
        }
        return result;
      },
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.html')) {
        server.ws.send({
          type: 'full-reload',
          path: '*',
        });
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [htmlPartialsPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
