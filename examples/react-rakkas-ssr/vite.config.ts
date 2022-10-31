import { defineConfig } from 'vite';
import rakkas from 'rakkasjs/vite-plugin';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

import path from 'path';

export default defineConfig({
  plugins: [rakkas(), vanillaExtractPlugin({ identifiers: 'debug' })],
  resolve: {
    alias: {
      '@dessert-box/react': path.resolve(__dirname, '../../packages/react'),
    },
  },
});
