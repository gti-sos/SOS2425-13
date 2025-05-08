<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import * as Highcharts from 'highcharts';

	// Variables para almacenar datos
	let spanishParks = [];
	let usParks = [];
	let loading = true;
	let error = null;
	let chartContainer;

	// URLs para las APIs
	const PARKS_API = dev
		? 'http://localhost:16078/api/v2/national-parks'
		: 'https://sos2425-13.onrender.com/api/v2/national-parks';
	const NPS_API = dev
		? 'http://localhost:16078/api/v2/proxy/nps/parks'
		: 'https://sos2425-13.onrender.com/api/v2/proxy/nps/parks';

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

	// Función para obtener datos de parques estadounidenses
	async function fetchUSParks() {
		try {
			// Obtener solo parques nacionales (designation=National Park) y limitar a 50
			const response = await fetch(`${NPS_API}?limit=50&q=designation:National%20Park`);
			if (!response.ok) {
				throw new Error(`Error obteniendo parques estadounidenses: ${response.status}`);
			}
			const data = await response.json();
			console.log('Datos de parques estadounidenses:', data);

			// La API NPS devuelve los datos dentro de un objeto data
			usParks = data.data || [];
		} catch (err) {
			console.error('Error al cargar datos de parques estadounidenses:', err);
			error = err.message;
		}
	}

	// Función para inicializar el gráfico usando Highcharts
	function initChart() {
		if (!chartContainer) return;

		// Usar directamente la importación de Highcharts, no cargar desde CDN
		Highcharts.chart(chartContainer, {
			chart: {
				type: 'bar', // Barras horizontales (diferente a column que son verticales)
				height: 400
			},
			title: {
				text: 'Comparativa de Parques Nacionales',
				align: 'center'
			},
			subtitle: {
				text: 'España vs. Estados Unidos',
				align: 'center'
			},
			xAxis: {
				categories: ['España', 'Estados Unidos'],
				title: {
					text: null
				},
				labels: {
					style: {
						fontSize: '16px',
						fontWeight: 'bold'
					}
				}
			},
			yAxis: {
				min: 0,
				title: {
					text: 'Número de Parques Nacionales',
					align: 'high'
				},
				labels: {
					overflow: 'justify'
				}
			},
			tooltip: {
				valueSuffix: ' parques'
			},
			plotOptions: {
				bar: {
					dataLabels: {
						enabled: false // Cambiado de true a false para eliminar las etiquetas numéricas
					},
					borderRadius: 5,
					pointWidth: 50
				}
			},
			legend: {
				enabled: false
			},
			credits: {
				enabled: false
			},
			series: [
				{
					name: 'Parques Nacionales',
					data: [
						{
							y: spanishParks.length,
							color: '#FF9933', // Color naranja para España
							borderColor: '#E68A00'
						},
						{
							y: usParks.length,
							color: '#0052A5', // Color azul para EE.UU.
							borderColor: '#003366'
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
			await Promise.all([fetchSpanishParks(), fetchUSParks()]);
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
	<h2>Integración con National Park Service (EE.UU.)</h2>

	<div class="button-group">
		<a href="/graficos/national-parks">
			<button>Volver a Parques Nacionales</button>
		</a>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="loading">Cargando datos de parques nacionales...</div>
		</div>
	{:else if error}
		<div class="error-container">
			<div class="error">Error: {error}</div>
		</div>
	{:else}
		<div class="explanation">
			<p>
				Esta visualización compara el número de parques nacionales entre España y Estados Unidos. El
				gráfico de barras muestra claramente la diferencia numérica entre ambos sistemas de parques.
			</p>
		</div>

		<div class="chart-container" bind:this={chartContainer}>
			<!-- El gráfico se renderizará aquí -->
		</div>

		<div class="sources">
			<h4>Fuentes de datos:</h4>
			<ul>
				<li>Parques Nacionales: <a href="https://sos2425-13.onrender.com/api/v2/national-parks" target="_blank">API del Grupo 13 (SOS2425-13)</a></li>
				<li>Parques Nacionales de EE.UU.: <a href="https://www.nps.gov/subjects/developer/api-documentation.htm" target="_blank">National Park Service API</a></li>
			</ul>
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 1000px;
		margin: 0 auto;
		padding: 20px;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

	.sources {
		font-size: 14px;
		color: #555;
		border-top: 1px solid #eee;
		padding-top: 15px;
	}

	.sources h4 {
		margin-top: 0;
	}

	.sources ul {
		padding-left: 20px;
	}
</style>
