<svelte:head>
	<title>SOS2425-13</title>
</svelte:head>

<main>
	<nav>
		<div class="container">
			<a id="inicio" href="/">Inicio</a>
			<a id="about" href="/about.html">Acerca de nosotros</a>
			<a id="forest-fires" href="/forest-fires">Incendios forestales</a>
			<a id="national-parks" href="/national-parks">Parques naturales</a>
			<a id="water-supply-improvements" href="/water-supply-improvements">Suministro de agua</a>
		</div>
	</nav>
</main>

<style>
	body {
    margin: 0;
    font-family: 'Segoe UI', sans-serif;
    background-color: #fafafa; /* fondo general */
    min-height: 100vh;
}

	nav {
		background-color: #f2f2f2; /* fondo neutro claro que sí combina */
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
		padding: 20px 0;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 20px;
	}

	a {
		text-decoration: none;
		font-size: 1.15rem;
		padding: 10px 20px;
		border-radius: 10px;
		font-weight: 600;
		color: #333;
		background-color: #e0e0e0; /* color neutro base */
		transition:
			background-color 0.3s,
			color 0.3s;
	}

	/* Hover temático por ID */
	#inicio:hover {
		background-color: #1a237e;
		color: white;
	}

	#about:hover {
		background-color: #424242;
		color: white;
	}

	#forest-fires:hover {
		background-color: #d32f2f;
		color: white;
	}

	#national-parks:hover {
		background-color: #2e7d32;
		color: white;
	}

	#water-supply-improvements:hover {
		background-color: #0288d1;
		color: white;
	}

	@media (max-width: 768px) {
		.container {
			flex-direction: column;
			gap: 12px;
		}
	}
</style>
