<script lang="ts">
	let openId: string = '';
	const toggle = (id: string) => {
		openId = openId === id ? '' : id;
	};

	const sections = [
		{
			id: 'plants',
			title: 'Página de Plantas',
			description: `Visualmente, la altura de cada barra refleja directamente el valor numérico de cada métrica, facilitando comparar de un vistazo cuántas plantas hay frente al número de proyectos de agua`,
			link: '/integrations/water-supply-improvements/externas/plantas'
		},
		{
			id: 'idealista',
			title: 'Página de Viviendas en Venta vs Proyectos en Madrid',
			description: `Este gráfico facilita comparar de un vistazo las dos magnitudes obtenidas de tus APIs — la altura de las barras hace evidente la diferencia entre el tamaño del mercado inmobiliario madrileño y el volumen de proyectos de mejora de agua.`,
			link: '/integrations/water-supply-improvements/externas/idealista'
		},
		{
			id: 'tiempo',
			title: 'Lluvias VS Ayudas económicas para agua en España',
			description: `En conjunto, este diagrama facilita ver lado a lado —para cada Comunidad Autónoma— cuánto se invirtió en mejoras de abastecimiento y cuánta lluvia cayó ese año, ayudando a analizar si existe alguna relación o discrepancia entre inversión y precipitaciones.`,
			link: '/integrations/water-supply-improvements/externas/tiempo'
		}
	];
</script>

<main>
	<h1>Resumen de Páginas Externas</h1>
	<div class="grid-container">
		{#each sections as section}
			<div class="interactive-box {openId === section.id ? 'expanded' : ''}">
				<button on:click={() => toggle(section.id)}>{section.title}</button>
				{#if openId === section.id}
					<div class="content">
						<p>{section.description}</p>
						<a href={section.link}>Ir a {section.title}</a>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</main>

<style>
	main {
		margin: 20px;
		color: #000;
	}
	h1 {
		margin-bottom: 20px;
		font-size: 24px;
		text-align: center;
	}
	.grid-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 30px;
	}
	.interactive-box {
		background-color: #e0e4cc;
		border-radius: 12px;
		overflow: hidden;
		transition: max-height 0.3s ease;
		max-height: 50px;
	}
	.interactive-box.expanded {
		max-height: 500px;
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
	}
	.content p {
		margin-bottom: 10px;
	}
	.content a {
		color: #000;
		text-decoration: underline;
	}
</style>
