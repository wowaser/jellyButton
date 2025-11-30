import { defineConfig } from 'vite';
import typegpuPlugin from 'unplugin-typegpu/vite';
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [typegpuPlugin(),mkcert()],
});
