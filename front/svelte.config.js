import adapter from '@sveltejs/adapter-node';

const config = {
	kit: {
		adapter: adapter(),
		csp: {
			mode: 'auto',
			directives: {
				'script-src': ['self', 'unsafe-inline'],
				'default-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'https:'],
				'connect-src': ['self', 'https://sos2425-13.onrender.com', 'http://localhost:16078']
			}
		}
	}
};

export default config;
