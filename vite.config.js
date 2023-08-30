import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';
import { normalizePath } from 'vite'
import tailwindcss from 'tailwindcss'

export default {
  root: 'src',
  base: '',
  build: {
    outDir: '../dist'
  },
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
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
};
