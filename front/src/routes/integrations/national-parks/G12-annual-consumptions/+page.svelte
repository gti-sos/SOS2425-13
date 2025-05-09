<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import ApexCharts from 'apexcharts';
	import { dev } from '$app/environment';

	// URLs para las APIs
	const PARKS_API = dev
		? 'http://localhost:16078/api/v2/national-parks'
		: 'https://sos2425-13.onrender.com/api/v2/national-parks';
	const CONSUMPTIONS_API = dev
		? 'http://localhost:16078/api/v2/proxy/annual-consumptions'
		: 'https://sos2425-13.onrender.com/api/v2/proxy/annual-consumptions';

	// Variables para almacenar los datos
	let parksData = [];
	let consumptionsData = [];
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

	// Función para obtener datos de consumos anuales
	async function fetchConsumptionsData() {
		try {
			const response = await fetch(CONSUMPTIONS_API);
			if (!response.ok) {
				throw new Error(`Error fetching consumptions data: ${response.status}`);
			}
			const data = await response.json();
			console.log('Consumptions data:', data);
			// Mostrar la estructura del primer elemento para debug
			if (data.length > 0) {
				console.log('Estructura de un elemento de consumo:', data[0]);
			}
			consumptionsData = data;
		} catch (error) {
			console.error('Failed to load annual consumptions data:', error);
		}
	}

	// Función para procesar y combinar los datos
	function processCombinedData() {
		// Normalizar nombres de comunidades
		function normalizeCommunity(name) {
			if (!name) return '';

			const normalizeMap = {
				andalucía: 'andalucia',
				andalucia: 'andalucia',
				'castilla-la mancha': 'castilla la mancha',
				'castilla la mancha': 'castilla la mancha',
				'madrid, castilla y león': 'madrid y castilla y leon',
				'castilla y león': 'castilla y leon',
				'castilla y leon': 'castilla y leon',
				'illes balears': 'baleares',
				'islas baleares': 'baleares',
				baleares: 'baleares'
			};

			const lowercase = name.toLowerCase();
			return normalizeMap[lowercase] || lowercase;
		}

		// Agrupar datos de parques por comunidad
		const parksByCommunity = {};
		parksData.forEach((park) => {
			// Manejar comunidades múltiples (separadas por comas)
			const communities = park.autonomous_community.split(',').map((c) => c.trim());

			communities.forEach((community) => {
				const normalizedCommunity = normalizeCommunity(community);

				if (!parksByCommunity[normalizedCommunity]) {
					parksByCommunity[normalizedCommunity] = {
						totalArea: 0,
						count: 0,
						displayName: community
					};
				}

				// Distribuir el área equitativamente si el parque pertenece a varias comunidades
				const areaShare = park.current_area / communities.length;
				parksByCommunity[normalizedCommunity].totalArea += areaShare;
				parksByCommunity[normalizedCommunity].count += 1 / communities.length;
			});
		});

		// Agrupar datos de consumos por comunidad autónoma
		const consumptionsByCommunity = {};
		consumptionsData.forEach((consumption) => {
			// IMPORTANTE: Usar el campo aacc en lugar de autonomous_community
			const community = consumption.aacc || '';
			if (!community) return;

			const normalizedCommunity = normalizeCommunity(community);

			if (!consumptionsByCommunity[normalizedCommunity]) {
				consumptionsByCommunity[normalizedCommunity] = {
					totalConsumption: 0,
					count: 0,
					years: {},
					displayName: community
				};
			}

			// IMPORTANTE: Usar total_consumption para el valor de consumo
			const consumptionValue = consumption.total_consumption || 0;
			const year = consumption.year || 2022;

			consumptionsByCommunity[normalizedCommunity].totalConsumption += consumptionValue;
			consumptionsByCommunity[normalizedCommunity].count += 1;

			if (!consumptionsByCommunity[normalizedCommunity].years[year]) {
				consumptionsByCommunity[normalizedCommunity].years[year] = 0;
			}
			consumptionsByCommunity[normalizedCommunity].years[year] += consumptionValue;
		});

		console.log('Consumos por comunidad:', consumptionsByCommunity);

		// Encontrar comunidades que aparecen en ambos conjuntos de datos
		const commonCommunities = Object.keys(parksByCommunity).filter(
			(community) => consumptionsByCommunity[community]
		);

		console.log('Comunidades en parques:', Object.keys(parksByCommunity));
		console.log('Comunidades en consumos:', Object.keys(consumptionsByCommunity));
		console.log('Comunidades comunes:', commonCommunities);

		// Preparar datos para el gráfico de heat map
		const series = [];
		const parksAreaByComm = [];
		const consumptionByComm = [];
		const communities = [];

		commonCommunities.forEach((community) => {
			communities.push(parksByCommunity[community].displayName);

			// Áreas de parques en miles de hectáreas
			const parkArea = parksByCommunity[community].totalArea / 1000;
			parksAreaByComm.push(parkArea);

			// Consumo promedio
			const avgConsumption =
				consumptionsByCommunity[community].totalConsumption /
				consumptionsByCommunity[community].count;
			consumptionByComm.push(avgConsumption);

			// Datos para heatmap
			const yearsData = Object.entries(consumptionsByCommunity[community].years).map(
				([year, consumption]) => ({
					x: year,
					y: consumption / parkArea // Consumo por hectárea de parque
				})
			);

			if (yearsData.length > 0) {
				series.push({
					name: parksByCommunity[community].displayName,
					data: yearsData
				});
			}
		});

		return {
			communities,
			parksAreaByComm,
			consumptionByComm,
			series
		};
	}

	// Función para inicializar el gráfico de calor
	function initHeatmapChart() {
		if (parksData.length === 0 || consumptionsData.length === 0) {
			console.error('No data available for chart');
			return;
		}

		const { communities, parksAreaByComm, consumptionByComm, series } = processCombinedData();

		// Si no hay suficientes datos, mostrar un mensaje
		if (communities.length === 0) {
			chartContainer.innerHTML =
				'<div class="no-data">No hay suficientes datos comunes entre parques nacionales y consumos anuales</div>';
			return;
		}

		// Configuración del gráfico combinado (bar + heatmap)
		const options = {
			series: [
				{
					name: 'Área de Parques (miles ha)',
					type: 'bar',
					data: parksAreaByComm
				},
				{
					name: 'Consumo Anual (litros/día/persona)',
					type: 'bar', // Cambiado a bar en lugar de treemap/line
					data: consumptionByComm
				}
			],
			chart: {
				height: 500,
				type: 'bar', // Tipo principal: bar
				stacked: false,
				toolbar: {
					show: true
				}
			},
			stroke: {
				width: [1, 1],
				colors: ['#47A248', '#2E86C1']
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
					borderRadius: 4,
					dataLabels: {
						position: 'top'
					}
				}
			},
			title: {
				text: 'Relación entre Parques Nacionales y Consumo de Agua por Comunidad',
				align: 'center',
				style: {
					fontSize: '16px'
				}
			},
			fill: {
				opacity: [0.85, 0.75],
				type: ['solid', 'solid']
			},
			dataLabels: {
				enabled: true,
				enabledOnSeries: [0, 1],
				formatter: function (val, opts) {
					return val.toFixed(1);
				},
				offsetY: -20,
				style: {
					fontWeight: 'normal',
					colors: ['#111']
				},
				background: {
					enabled: true,
					padding: 4,
					borderRadius: 2,
					borderWidth: 1,
					borderColor: '#fff',
					opacity: 0.8
				}
			},
			colors: ['#47A248', '#2E86C1'],
			xaxis: {
				categories: communities,
				labels: {
					rotate: -45,
					style: {
						fontSize: '12px'
					}
				},
				title: {
					text: 'Comunidades Autónomas'
				}
			},
			yaxis: [
				{
					title: {
						text: 'Superficie de Parques (miles ha)',
						style: {
							color: '#47A248'
						}
					},
					labels: {
						style: {
							colors: '#47A248'
						}
					}
				},
				{
					opposite: true,
					title: {
						text: 'Consumo de Agua (litros/día/persona)',
						style: {
							color: '#2E86C1'
						}
					},
					labels: {
						style: {
							colors: '#2E86C1'
						}
					}
				}
			],
			tooltip: {
				shared: true,
				intersect: false,
				y: {
					formatter: function (y, { seriesIndex }) {
						if (seriesIndex === 0) {
							return y.toFixed(2) + ' miles ha';
						} else if (seriesIndex === 1) {
							return y.toFixed(1) + ' l/día';
						}
						return y;
					}
				}
			},
			legend: {
				position: 'bottom'
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
		await Promise.all([fetchParksData(), fetchConsumptionsData()]);

		// Inicializar el gráfico cuando tenemos ambos conjuntos de datos
		if (parksData.length > 0 && consumptionsData.length > 0) {
			initHeatmapChart();
		}

		// Limpieza al desmontar
		return () => {
			if (chartInstance) {
				chartInstance.destroy();
			}
		};
	});
</script>

<svelte:head>
	<title>Biodiversidad en Parques Nacionales - Integración con G12-annual-consumptions</title>
	<meta name="description" content="Visualización de la api del grupo 12" />
</svelte:head>

<main>
	<h2>Integración: Parques Nacionales y Consumos de Agua</h2>

	<div class="button-group">
		<a href="/graficos/national-parks">
			<button>Volver a Parques Nacionales</button>
		</a>
	</div>

	<div class="explanation">
		<p>
			Este gráfico muestra la relación entre la superficie de parques nacionales (en miles de
			hectáreas) y el consumo medio de agua (en litros por persona y día) en diferentes comunidades
			autónomas de España.
		</p>
		<p>
			La visualización permite analizar si existe alguna correlación entre la presencia de espacios
			naturales protegidos y los hábitos de consumo de agua en cada región.
		</p>
	</div>

	<div class="chart-container" bind:this={chartContainer}>
		<!-- El gráfico se renderizará aquí -->
		{#if !parksData.length || !consumptionsData.length}
			<div class="loading">Cargando datos...</div>
		{/if}
	</div>

	<div class="sources">
		<h3>Fuentes de datos:</h3>
		<ul>
			<li>Parques Nacionales: API del Grupo 13 (SOS2425-13)</li>
			<li>Consumos Anuales de Agua: API del Grupo 12 (SOS2425-12)</li>
		</ul>
	</div>
</main>

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
		color: #2c3e50;
		text-align: center;
		margin-bottom: 1rem;
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

	.sources {
		background-color: #f5f5f5;
		padding: 20px;
		border-radius: 8px;
		margin: 30px 0;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
</style>
