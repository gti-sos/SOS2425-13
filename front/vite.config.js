import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:16078',
				changeOrigin: true,
				secure: false
			}
		}
	},
	build: {
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: undefined
			}
		}
	}
});
