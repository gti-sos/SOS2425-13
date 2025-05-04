<script lang="ts">
	// Estados para cada sección de visibilidad
	let isPostmanVisible = false;
	let isRepoVisible = false;
	let isApisDevVisible = false;
	let isFrontendVisible = false;
	let isMiembrosVisible = false;

	function toggleVisibility(section: string) {
		const isSame =
			(section === 'postman' && isPostmanVisible) ||
			(section === 'repo' && isRepoVisible) ||
			(section === 'apis' && isApisDevVisible) ||
			(section === 'frontend' && isFrontendVisible) ||
			(section === 'miembros' && isMiembrosVisible);

		// Reset de todas las secciones
		isPostmanVisible = false;
		isRepoVisible = false;
		isApisDevVisible = false;
		isFrontendVisible = false;
		isMiembrosVisible = false;

		// Si no es la misma sección, la abrimos
		if (!isSame) {
			if (section === 'postman') isPostmanVisible = true;
			else if (section === 'repo') isRepoVisible = true;
			else if (section === 'apis') isApisDevVisible = true;
			else if (section === 'frontend') isFrontendVisible = true;
			else if (section === 'miembros') isMiembrosVisible = true;
		}
	}
</script>


	<main>
		<div>
			<h2>Descripción del proyecto</h2>
			<p class="description">
				Nuestro proyecto se basa en la integración de datos sobre incendios forestales, parques
				naturales y ayudas para el abastecimiento de agua, con el objetivo de analizar la relación
				entre la disponibilidad de este recurso y su impacto en la gestión ambiental y social. A
				través de esta unión de información, buscamos identificar patrones que permitan mejorar la
				prevención y respuesta ante incendios, optimizar la conservación de ecosistemas en áreas
				protegidas y evaluar la efectividad de los subsidios destinados a mitigar la escasez hídrica
				en municipios vulnerables.
			</p>
		</div>

		<div>
			<h2>Enlace del repositorio</h2>
			<p>
				<a href="https://github.com/gti-sos/SOS2425-13" target="_blank" class="repo-link"
					>GitHub Repository</a
				>
			</p>
		</div>

		<div>
			<h2>Secciones del Proyecto</h2>
			<p class="description">
				Cada panel es interactivo, clica en alguno para que muestre los enlaces.
			</p>
		</div>

		<div class="grid-container">
			<div class="interactive-box {isMiembrosVisible ? 'expanded' : ''}">
				<button on:click={() => toggleVisibility('miembros')}>Miembros del equipo</button>
				{#if isMiembrosVisible}
					<div class="content">
						<ul>
							<li>Blanca García Alonso – water-supply-improvements</li>
							<li>Darío López Villegas – national-parks</li>
							<li>Álvaro Morillo Navajas – forest-fires</li>
						</ul>
					</div>
				{/if}
			</div>
			<!-- Documentación Postman -->

			<div class="interactive-box {isPostmanVisible ? 'expanded' : ''}">
				<button on:click={() => toggleVisibility('postman')}>Documentación Postman</button>
				{#if isPostmanVisible}
					<div class="content">
						<ul>
							<li>
								<a href="https://documenter.getpostman.com/view/42334859/2sB2cVe2Fy"
									>API Water Supply Improvements</a
								>
							</li>
							<li>
								<a href="https://documenter.getpostman.com/view/14944672/2sB2cUBNyt"
									>API National Parks</a
								>
							</li>
							<li>
								<a href="https://documenter.getpostman.com/view/42116184/2sB2cUBNgF"
									>API Forest Fires</a
								>
							</li>
						</ul>
					</div>
				{/if}
			</div>

			<!-- GitHub individual de cada miembro -->
			<div class="interactive-box {isRepoVisible ? 'expanded' : ''}">
				<button on:click={() => toggleVisibility('repo')}>GitHub individual de cada miembro</button>
				{#if isRepoVisible}
					<div class="content">
						<ul>
							<li>
								<a href="https://github.com/blancagrclns" target="_blank">Blanca García Alonso</a>
							</li>
							<li>
								<a href="https://github.com/darlopvil" target="_blank">Darío López Villegas</a>
							</li>
							<li>
								<a href="https://github.com/alvmornav" target="_blank">Alvaro Morillo Navajas</a>
							</li>
						</ul>
					</div>
				{/if}
			</div>

			<!-- APIs Desarrolladas -->
			<div class="interactive-box {isApisDevVisible ? 'expanded' : ''}">
				<button on:click={() => toggleVisibility('apis')}>APIs Desarrolladas</button>
				{#if isApisDevVisible}
					<div class="content">
						<ul>
							<li>
								<a href="http://sos2425-13.onrender.com/api/v1/water-supply-improvements"
									>Water Supply Improvements</a
								>
							</li>
							<li>
								<a href="http://sos2425-13.onrender.com/api/v2/national-parks">National Parks</a>
							</li>
							<li><a href="http://sos2425-13.onrender.com/api/v1/forest-fires">Forest Fires</a></li>
						</ul>
					</div>
				{/if}
			</div>

			<!-- FrontEnd -->
			<div class="interactive-box {isFrontendVisible ? 'expanded' : ''}">
				<button on:click={() => toggleVisibility('frontend')}>FrontEnd</button>
				{#if isFrontendVisible}
					<div class="content">
						<ul>
							<li>
								<a href="http://sos2425-13.onrender.com/water-supply-improvements"
									>Water Supply Improvements</a
								>
							</li>
							<li>
								<a href="http://sos2425-13.onrender.com/national-parks">National Parks</a>
							</li>
							<li>
								<a href="http://sos2425-13.onrender.com/forest-fires">Forest Fires</a>
							</li>
						</ul>
					</div>
				{/if}
			</div>

			<!-- Informe de Horas -->
			<div class="interactive-box">
				<a href="/analytics" style="display:block; width:100%;">
					<button>Análisis</button>
				</a>
			</div>
		</div>
	</main>


<style>
	
	main {
		margin: 20px;
		color: #000;
	}
	h1,
	h2,
	p,
	li,
	th,
	td,
	button {
		color: #000;
	}
	h2 {
		margin: 75px 0;
		font-size: 24px;
		margin-bottom: 10px;
	}
	.description {
		margin: 10px 0;
		font-size: 18px;
		line-height: 1.5;
		margin-bottom: 20px;
	}

	.grid-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 30px;
	}

	.interactive-box {
		margin: 10px 0;
		background-color: #e0e4cc;
		border-radius: 12px;
		overflow: hidden;
		transition: max-height 0.3s ease;
		max-height: 50px;
	}
	.interactive-box.expanded {
		max-height: 1000px;
		text-align: center;
	}

	button {
		background-color: #a8c686;
		color: #000;
		font-size: 16px;
		padding: 10px;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		width: 100%;
		text-align: center;
	}
	button:hover {
		background-color: #9bb37c;
	}

	.content {
		padding: 10px;
		text-align: center;
	}

	.content ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.content li {
		margin: 0.5rem 0;
	}

	a {
		color: #000;
		text-decoration: none;
	}
	a.repo-link {
		text-decoration: underline;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 10px;
	}
	th,
	td {
		padding: 6px;
		border-bottom: 1px solid #ccc;
		font-size: 14px;
		text-align: left;
	}
</style>
