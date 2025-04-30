<svelte:head>
	<title>Inicio | SOS2425-13</title>
</svelte:head>

<main class="home">
	<section class="header">
		<img src="/favicon.ico" alt="Logo del proyecto" class="logo" />
		<h1>Proyecto SOS2425-13</h1>
		<p>
			Análisis integral de datos abiertos en España para mejorar la gestión ambiental mediante APIs
			REST y visualización con SvelteKit.
		</p>
	</section>

	<section class="grid-section">
		<h2>Explora nuestros recursos</h2>
		<div class="resource-grid">
			<a href="/forest-fires" class="resource-card">
				<h3>🔥 Incendios forestales</h3>
				<p>Estadísticas de incendios por comunidad.</p>
			</a>
			<a href="/national-parks" class="resource-card">
				<h3>🌳 Parques naturales</h3>
				<p>Listado y gestión de espacios protegidos.</p>
			</a>
			<a href="/water-supply-improvements" class="resource-card">
				<h3>💧 Suministro de agua</h3>
				<p>Proyectos de mejora y población beneficiada.</p>
			</a>
		</div>
	</section>

	<section class="links">
		<h2>Enlaces del proyecto</h2>
		<ul>
			<li>
				<a href="https://github.com/gti-sos/SOS2425-13" target="_blank" rel="noopener noreferrer">
					<img
						src="/github.png"
						alt="GitHub"
						class="icon"
					/>
					Repositorio GitHub
				</a>
			</li>
			<li><a href="/about.html">ℹ️ Acerca de nosotros</a></li>
			<li><a href="https://sos2425-13.onrender.com">🌐 API desplegada en Render</a></li>
		</ul>
	</section>

	<section class="links">
		<h2>Documentación de APIs (Postman)</h2>
		<ul>
			<li>
				<a href="https://sos2425-13.onrender.com/api/v1/forest-fires/docs">🔥 forest-fires</a>
			</li>
			<li>
				<a href="https://sos2425-13.onrender.com/api/v1/national-parks/docs">🌲 national-parks</a>
			</li>
			<li>
				<a href="https://sos2425-13.onrender.com/api/v1/water-supply-improvements/docs"
					>💧 water-supply-improvements</a
				>
			</li>
		</ul>
	</section>

	<section class="apis">
		<h2>APIs REST disponibles</h2>
		<ul>
			<li><a href="https://sos2425-13.onrender.com/api/v1/forest-fires">🔥 forest-fires</a></li>
			<li><a href="https://sos2425-13.onrender.com/api/v2/national-parks">🌳 national-parks</a></li>
			<li>
				<a href="https://sos2425-13.onrender.com/api/v1/water-supply-improvements"
					>💧 water-supply-improvements</a
				>
			</li>
		</ul>
	</section>
	<section class="apis">
		<h2>Equipo SOS2425-13</h2>
		<ul>
			<li><strong>Alvaro Morillo Navajas</strong> – API: <code>forest-fires</code></li>
			<li><strong>Darío López Villegas</strong> – API: <code>national-parks</code></li>
			<li><strong>Blanca garcía Alonso</strong> – API: <code>water-supply-improvements</code></li>
		</ul>
	</section>
</main>

<style>
	:root {
		--color-bg: #f9f9fb;
		--color-primary: #2c3e50;
		--color-accent: #1abc9c;
		--color-card: #ffffff;
		--radius: 12px;
		--shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
	}
	.icon {
		width: 20px;
		height: 20px;
		vertical-align: middle;
		margin-right: 8px;
	}

	main.home {
		max-width: 960px;
		margin: auto;
		padding: 2rem;
		font-family: 'Segoe UI', sans-serif;
		background: var(--color-bg);
		color: var(--color-primary);
	}

	.header {
		text-align: center;
		margin-bottom: 2.5rem;
	}
	.logo {
		width: 60px;
		height: auto;
		margin-bottom: 0.5rem;
	}

	.header h1 {
		font-size: 2.6rem;
		margin-bottom: 0.5rem;
	}

	.header p {
		font-size: 1.15rem;
		color: #555;
	}

	.grid-section h2,
	.links h2,
	.apis h2 {
		margin: 2rem 0 1rem;
		text-align: center;
		color: var(--color-primary);
		font-size: 1.6rem;
	}

	.resource-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1.2rem;
	}

	.resource-card {
		background: var(--color-card);
		padding: 1.5rem;
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		text-decoration: none;
		color: inherit;
		transition:
			transform 0.2s ease,
			background 0.3s ease;
		border: 1px solid #eaeaea;
	}

	.resource-card:hover {
		transform: translateY(-5px);
		background: #ecfdf5;
	}

	.resource-card h3 {
		margin-bottom: 0.5rem;
	}

	ul {
		list-style: none;
		padding: 0;
		text-align: center;
	}

	ul li {
		margin-bottom: 0.7rem;
		font-size: 1rem;
	}

	ul li a {
		color: var(--color-accent);
		text-decoration: none;
		transition: color 0.2s;
	}

	ul li a:hover {
		text-decoration: underline;
		color: #16a085;
	}

	@media (max-width: 600px) {
		.header h1 {
			font-size: 2rem;
		}
	}
</style>
