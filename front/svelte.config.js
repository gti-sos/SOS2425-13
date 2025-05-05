import adapter from '@sveltejs/adapter-node';

const config = {
	kit: {
		adapter: adapter(),
		csp: {
			mode: 'auto',
			directives: {
				'script-src': ['self'], // Eliminamos 'unsafe-inline' para mayor seguridad
				'default-src': ['self'],
				'style-src': ['self', 'unsafe-inline', 'https://cdn.jsdelivr.net'], // Evitamos 'unsafe-inline'
				'img-src': ['self', 'data:', 'https:'],
				'connect-src': [
					'self', // Permite las conexiones locales
					'http://localhost:16078', // Si trabajas localmente
					'https://sos2425-13.onrender.com', // La API de tráfico
					'https://sos2425-20.onrender.com', // La API de proyectos de agua
					'https://sos2425-10.onrender.com', // API del grupo 10
					'https://sos2425-12.onrender.com', // API del grupo 12
					'https://sos2425-14.onrender.com', // API del grupo 14
					'https://sos2425-20.onrender.com', // API del grupo 20
					'https://sos2425-21.onrender.com'  // API del grupo 21
				]
			}
		}
	}
};

export default config;

