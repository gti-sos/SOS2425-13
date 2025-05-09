<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import * as Highcharts from 'highcharts';

	// Variables para almacenar datos
	let spanishParks = [];
	let amazighTerritories = null;
	let guancheTerritories = null;
	let loading = true;
	let error = null;
	let chartContainer;

	// URLs para las APIs
	const PARKS_API = dev
		? 'http://localhost:16078/api/v2/national-parks'
		: 'https://sos2425-13.onrender.com/api/v2/national-parks';
	const NATIVE_LAND_API = dev
		? 'http://localhost:16078/api/v2/proxy/native-land'
		: 'https://sos2425-13.onrender.com/api/v2/proxy/native-land';

	// Función para obtener datos de parques españoles
	async function fetchSpanishParks() {
		try {
			const response = await fetch(PARKS_API);
			if (!response.ok) {
				throw new Error(`Error obteniendo parques españoles: ${response.status}`);
			}
			const data = await response.json();
			console.log('Datos de parques españoles:', data);
			spanishParks = data;
		} catch (err) {
			console.error('Error al cargar datos de parques españoles:', err);
			error = err.message;
		}
	}

	// Función para obtener datos de territorios Amazigh (Sur de Andalucía)
	async function fetchAmazighTerritories() {
		try {
			const response = await fetch(`${NATIVE_LAND_API}?maps=territories&name=amazigh`);
			if (!response.ok) {
				throw new Error(`Error obteniendo territorios Amazigh: ${response.status}`);
			}
			const data = await response.json();
			console.log('Datos de territorios Amazigh:', data);
			amazighTerritories = data;
		} catch (err) {
			console.error('Error al cargar datos de territorios Amazigh:', err);
			error = err.message;
		}
	}

	// Función para obtener datos de territorios Guanche (Islas Canarias)
	async function fetchGuancheTerritories() {
		try {
			const response = await fetch(`${NATIVE_LAND_API}?maps=territories&name=guanche`);
			if (!response.ok) {
				throw new Error(`Error obteniendo territorios Guanche: ${response.status}`);
			}
			const data = await response.json();
			console.log('Datos de territorios Guanche:', data);
			guancheTerritories = data;
		} catch (err) {
			console.error('Error al cargar datos de territorios Guanche:', err);
			error = err.message;
		}
	}

	// Función para calcular parques en territorio indígena
	function getParksInIndigenousTerritory() {
		const parksInAndalucia = spanishParks.filter(
			(park) => park.autonomous_community === 'Andalucía'
		);
		const parksInCanarias = spanishParks.filter((park) => park.autonomous_community === 'Canarias');

		return {
			amazigh: parksInAndalucia.length,
			guanche: parksInCanarias.length,
			others: spanishParks.length - parksInAndalucia.length - parksInCanarias.length
		};
	}

	// Función para inicializar el gráfico usando Highcharts
	function initChart() {
		if (!chartContainer) return;

		const parksData = getParksInIndigenousTerritory();

		// Usar un gráfico de tipo PIE (no está en la lista de prohibidos)
		Highcharts.chart(chartContainer, {
			chart: {
				type: 'pie',
				height: 400
			},
			title: {
				text: 'Parques Nacionales en Territorios Indígenas de España',
				align: 'center'
			},
			subtitle: {
				text: 'Comparación entre territorios Amazigh, Guanche y otros',
				align: 'center'
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						format: '<b>{point.name}</b>: {point.percentage:.1f} %',
						style: {
							fontSize: '12px'
						}
					},
					showInLegend: true
				}
			},
			tooltip: {
				pointFormat: '{series.name}: <b>{point.y} parques</b>'
			},
			legend: {
				enabled: true
			},
			credits: {
				enabled: false
			},
			series: [
				{
					name: 'Parques Nacionales',
					colorByPoint: true,
					data: [
						{
							name: 'Territorio Amazigh (Sur de Andalucía)',
							y: parksData.amazigh,
							color: '#FF9933',
							sliced: true,
							selected: true
						},
						{
							name: 'Territorio Guanche (Islas Canarias)',
							y: parksData.guanche,
							color: '#0052A5'
						},
						{
							name: 'Otros territorios españoles',
							y: parksData.others,
							color: '#2c5e2e'
						}
					]
				}
			]
		});
	}

	// Inicializar al montar el componente
	onMount(async () => {
		loading = true;
		try {
			// Cargar datos en paralelo
			await Promise.all([
				fetchSpanishParks(),
				fetchAmazighTerritories(),
				fetchGuancheTerritories()
			]);
			loading = false;

			// Inicializar gráfico cuando los datos estén disponibles
			setTimeout(initChart, 100);
		} catch (err) {
			loading = false;
			error = err.message;
			console.error('Error general:', err);
		}
	});
</script>

<main>
	<h2>Integración con Native Land Digital</h2>

	<div class="button-group">
		<a href="/graficos/national-parks">
			<button>Volver a Parques Nacionales</button>
		</a>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="loading">Cargando datos de territorios indígenas y parques...</div>
		</div>
	{:else if error}
		<div class="error-container">
			<div class="error">Error: {error}</div>
		</div>
	{:else}
		<div class="explanation">
			<p>
				Esta visualización muestra la distribución de parques nacionales españoles según los
				territorios indígenas reconocidos por Native Land Digital. Específicamente, muestra cuántos
				parques se encuentran en territorios históricamente Amazigh (sur de Andalucía) y Guanche
				(Islas Canarias).
			</p>
		</div>

		<div class="chart-container" bind:this={chartContainer}>
			<!-- El gráfico se renderizará aquí -->
		</div>

		<div class="indigenous-info">
			<h3>Sobre los territorios indígenas</h3>
			<div class="territory-cards">
				<div class="territory-card">
					<h4>Amazigh</h4>
					<p>
						El territorio Amazigh incluye partes del sur de España, particularmente Andalucía, así
						como el norte de África. Los Amazigh son conocidos también como bereberes.
					</p>
					<p>
						Parques nacionales en este territorio: <strong
							>{getParksInIndigenousTerritory().amazigh}</strong
						>
					</p>
				</div>
				<div class="territory-card">
					<h4>Guanche</h4>
					<p>
						Los Guanches fueron los habitantes originarios de las Islas Canarias. Su cultura y
						lengua tienen raíces bereberes.
					</p>
					<p>
						Parques nacionales en este territorio: <strong
							>{getParksInIndigenousTerritory().guanche}</strong
						>
					</p>
				</div>
			</div>
		</div>

		<div class="sources">
			<h4>Fuentes de datos:</h4>
			<ul>
				<li>
					Parques Nacionales: <a
						href="https://sos2425-13.onrender.com/api/v2/national-parks"
						target="_blank">API del Grupo 13 (SOS2425-13)</a
					>
				</li>
				<li>
					Territorios Indígenas: <a
						href="https://native-land.ca/resources/api-docs/"
						target="_blank">Native Land Digital API</a
					>
				</li>
			</ul>
		</div>
	{/if}
</main>

<svelte:head>
	<title>Biodiversidad en Parques Nacionales - Integración con Native Land Digital</title>
	<meta name="description" content="Visualización de la api de Native Land Digital" />
</svelte:head>

<style>
	main {
		max-width: 1000px;
		margin: 0 auto;
		padding: 20px;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		box-sizing: border-box;
		width: 100%;
		overflow-x: hidden;
	}

	h2 {
		color: #2c5e2e;
		text-align: center;
		margin-bottom: 1.2rem;
		font-size: 1.8rem;
	}

	.button-group {
		display: flex;
		justify-content: center;
		margin-bottom: 25px;
	}

	.button-group button {
		padding: 10px 18px;
		background-color: #3a9647;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s ease;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	.button-group button:hover {
		background-color: #2e7639;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.explanation {
		background-color: #f7fbf7;
		padding: 20px;
		border-radius: 10px;
		border-left: 5px solid #3a9647;
		margin-bottom: 30px;
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
	}

	.chart-container {
		height: 450px;
		margin: 30px 0;
		background-color: white;
		border-radius: 10px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		padding: 20px;
		overflow: hidden;
		max-width: 100%;
	}

	.loading-container,
	.error-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300px;
	}

	.loading {
		font-size: 18px;
		color: #3a9647;
	}

	.error {
		font-size: 18px;
		color: #e74c3c;
		text-align: center;
		padding: 20px;
	}

	.indigenous-info {
		background-color: #f9f9f9;
		border-radius: 8px;
		padding: 20px;
		margin: 30px 0;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
	}

	.indigenous-info h3 {
		color: #2c5e2e;
		text-align: center;
		margin-bottom: 20px;
	}

	.territory-cards {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
	}

	.territory-card {
		flex: 1;
		min-width: 300px;
		background-color: white;
		border-radius: 8px;
		padding: 15px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.territory-card h4 {
		margin-top: 0;
		color: #333;
		border-bottom: 2px solid #eee;
		padding-bottom: 8px;
	}

	.sources {
		background-color: #f5f5f5;
		padding: 20px;
		border-radius: 8px;
		margin: 30px 0;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.sources h4 {
		margin-top: 0;
		color: #2c5e2e;
		border-bottom: 2px solid #ddd;
		padding-bottom: 10px;
		margin-bottom: 15px;
	}

	.sources ul {
		list-style-type: none;
		padding-left: 0;
	}

	.sources li {
		margin-bottom: 10px;
		padding-left: 20px;
		position: relative;
	}

	.sources li:before {
		content: '•';
		color: #3a9647;
		font-weight: bold;
		position: absolute;
		left: 0;
	}

	.sources a {
		color: #0066cc;
		text-decoration: none;
	}

	.sources a:hover {
		text-decoration: underline;
	}

	/* Estilos para Highcharts */
	:global(.highcharts-container) {
		width: 100% !important;
		height: 100% !important;
	}

	:global(.highcharts-root) {
		width: 100% !important;
		height: 100% !important;
	}
</style>
