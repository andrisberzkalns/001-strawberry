import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';
import { normalizePath } from 'vite'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist'
  },
  content: [
    "./src/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, './src/assets')) + '/[!.]*', // 1️⃣
          dest: './assets', // 2️⃣
        },
      ],
    }),
  ]
});
