import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Erzeugt die App-Icons aus public/icon.svg: npx pwa-assets-generator
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#2F6B3A' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#2F6B3A' } },
  },
  images: ['public/icon.svg'],
});
