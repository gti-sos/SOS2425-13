<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import ApexCharts from 'apexcharts';
	import { dev } from '$app/environment';

	// URLs para las APIs
	const PARKS_API = dev
		? 'http://localhost:16078/api/v2/national-parks'
		: 'https://sos2425-13.onrender.com/api/v2/national-parks';
	const PENSIONS_API = 'https://sos2425-11.onrender.com/api/v1/social-pension-payrolls';

	// Variables para almacenar los datos
	let parksData = [];
	let pensionsData = [];
	let chartInstance;
	let chartContainer;

	// Función para obtener datos de parques nacionales
	async function fetchParksData() {
		try {
			const response = await fetch(PARKS_API);
			if (!response.ok) {
				throw new Error(`Error fetching parks data: ${response.status}`);
			}
			const data = await response.json();
			console.log('Parks data:', data);
			parksData = data;
		} catch (error) {
			console.error('Failed to load national parks data:', error);
		}
	}

	// Función para obtener datos de pensiones sociales
	async function fetchPensionsData() {
		try {
			const response = await fetch(PENSIONS_API);
			if (!response.ok) {
				throw new Error(`Error fetching pensions data: ${response.status}`);
			}
			const data = await response.json();
			console.log('Pensions data:', data);
			pensionsData = data;
		} catch (error) {
			console.error('Failed to load pension payrolls data:', error);
		}
	}

	// Función para procesar y combinar los datos
	function processCombinedData() {
		// Agrupar datos de parques por comunidad autónoma
		const parksByCommunity = {};
		parksData.forEach((park) => {
			const community = park.autonomous_community;
			if (!parksByCommunity[community]) {
				parksByCommunity[community] = {
					totalArea: 0,
					count: 0
				};
			}
			parksByCommunity[community].totalArea += park.current_area || 0;
			parksByCommunity[community].count += 1;
		});

		// Agrupar datos de pensiones por comunidad autónoma
		const pensionsByCommunity = {};
		pensionsData.forEach((pension) => {
			const community = pension.autonomous_community;
			if (!pensionsByCommunity[community]) {
				pensionsByCommunity[community] = {
					totalAmount: 0,
					beneficiaries: 0
				};
			}
			pensionsByCommunity[community].totalAmount += pension.total_payroll_amount || 0;
			pensionsByCommunity[community].beneficiaries += pension.beneficiaries || 0;
		});

		// Encontrar comunidades que aparecen en ambos conjuntos de datos
		const commonCommunities = Object.keys(parksByCommunity).filter(
			(community) => pensionsByCommunity[community]
		);

		// Preparar datos para el gráfico
		const categories = commonCommunities;
		const parksAreaSeries = commonCommunities.map(
			(community) => parksByCommunity[community].totalArea / 1000
		); // Convertir a miles de hectáreas

		const pensionAmountSeries = commonCommunities.map(
			(community) => pensionsByCommunity[community].totalAmount / 1000000
		); // Convertir a millones de euros

		return {
			categories,
			parksAreaSeries,
			pensionAmountSeries
		};
	}

	// Función para inicializar el gráfico de radar
	function initRadarChart() {
		if (parksData.length === 0 || pensionsData.length === 0) {
			console.error('No data available for chart');
			return;
		}

		const { categories, parksAreaSeries, pensionAmountSeries } = processCombinedData();

		// Configuración del gráfico
		const options = {
			series: [
				{
					name: 'Área de Parques Nacionales (miles de ha)',
					data: parksAreaSeries
				},
				{
					name: 'Importe de Pensiones (millones €)',
					data: pensionAmountSeries
				}
			],
			chart: {
				type: 'radar',
				height: 500,
				dropShadow: {
					enabled: true,
					blur: 1,
					left: 1,
					top: 1
				}
			},
			title: {
				text: 'Relación entre Parques Nacionales y Pensiones Sociales por Comunidad Autónoma',
				align: 'center'
			},
			stroke: {
				width: 2
			},
			fill: {
				opacity: 0.4
			},
			markers: {
				size: 5,
				hover: {
					size: 10
				}
			},
			xaxis: {
				categories: categories,
				labels: {
					style: {
						fontSize: '12px'
					}
				}
			},
			yaxis: {
				show: false
			},
			colors: ['#2E7D32', '#D32F2F'],
			legend: {
				position: 'bottom',
				horizontalAlign: 'center',
				fontSize: '14px',
				markers: {
					width: 12,
					height: 12
				}
			},
			tooltip: {
				y: {
					formatter: function (val, { seriesIndex, dataPointIndex }) {
						if (seriesIndex === 0) {
							return val.toFixed(2) + ' miles de ha';
						} else {
							return val.toFixed(2) + ' millones €';
						}
					}
				}
			}
		};

		// Limpiar contenedor del gráfico si ya existe una instancia
		if (chartContainer) {
			chartContainer.innerHTML = '';
		}

		// Crear y renderizar el gráfico
		chartInstance = new ApexCharts(chartContainer, options);
		chartInstance.render();
	}

	// Inicializar todo al montar el componente
	onMount(async () => {
		// Cargar datos en paralelo
		await Promise.all([fetchParksData(), fetchPensionsData()]);

		// Inicializar el gráfico cuando tenemos ambos conjuntos de datos
		if (parksData.length > 0 && pensionsData.length > 0) {
			initRadarChart();
		}

		// Limpieza al desmontar
		return () => {
			if (chartInstance) {
				chartInstance.destroy();
			}
		};
	});
</script>

<main>
	<h2>Integración: Parques Nacionales y Pensiones Sociales</h2>

	<div class="button-group">
		<a href="/national-parks">
			<button>Volver a Parques Nacionales</button>
		</a>
		<a href="/integrations/national-parks">
			<button>Ver otras integraciones</button>
		</a>
	</div>

	<div class="explanation">
		<p>
			Este gráfico muestra la relación entre el área total de parques nacionales (en miles de
			hectáreas) y el importe total de pensiones sociales (en millones de euros) para cada comunidad
			autónoma que aparece en ambos conjuntos de datos.
		</p>
		<p>
			El gráfico de radar permite visualizar cómo se distribuyen estos recursos en diferentes
			comunidades, y si existe alguna correlación entre la preservación de espacios naturales y los
			recursos destinados a pensiones sociales.
		</p>
	</div>

	<div class="chart-container" bind:this={chartContainer}>
		<!-- El gráfico se renderizará aquí -->
		{#if !parksData.length || !pensionsData.length}
			<div class="loading">Cargando datos...</div>
		{/if}
	</div>

	<div class="data-sources">
		<h3>Fuentes de datos:</h3>
		<ul>
			<li>Parques Nacionales: API del Grupo 13 (SOS2425-13)</li>
			<li>Nóminas de Pensiones Sociales: API del Grupo 11 (SOS2425-11)</li>
		</ul>
	</div>
</main>

<style>
	main {
		max-width: 900px;
		margin: 0 auto;
		padding: 20px;
		font-family: Arial, sans-serif;
	}

	h2 {
		color: #2c3e50;
		text-align: center;
		margin-bottom: 1rem;
	}

	.button-group {
		display: flex;
		justify-content: center;
		margin-bottom: 20px;
	}

	.button-group button {
		margin: 0 10px;
		padding: 8px 12px;
		background-color: #a8c686;
		color: #000;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.button-group button:hover {
		background-color: #8ab061;
	}

	.explanation {
		background-color: #f9f9f9;
		padding: 15px;
		border-radius: 8px;
		margin-bottom: 20px;
		text-align: center;
	}

	.chart-container {
		height: 500px;
		margin: 30px 0;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		padding: 20px;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 18px;
		color: #666;
	}

	.data-sources {
		font-size: 14px;
		color: #555;
		padding: 10px;
		border-top: 1px solid #eee;
	}
</style>
