import { defineConfig, loadEnv } from 'vite';
import solidPlugin from 'vite-plugin-solid';


export default defineConfig(({command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  define: {
    VITE_API_URL: JSON.stringify(env.API_URL)
  }
}});
