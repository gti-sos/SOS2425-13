import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
    port: 5173,  // Establece el puerto 5173 para el servidor de desarrollo
  },
});
