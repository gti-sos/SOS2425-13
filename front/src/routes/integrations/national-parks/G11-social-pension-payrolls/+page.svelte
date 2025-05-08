<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import ApexCharts from 'apexcharts';
	import { dev } from '$app/environment';

	// URLs para las APIs
	const PARKS_API = dev
		? 'http://localhost:16078/api/v2/national-parks'
		: 'https://sos2425-13.onrender.com/api/v2/national-parks';
	const PENSIONS_API = dev
		? 'http://localhost:16078/api/v2/proxy/social-pension-payrolls'
		: 'https://sos2425-13.onrender.com/api/v2/proxy/social-pension-payrolls';

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
		// Normalizar nombres de comunidades para facilitar coincidencias
		function normalizeCommunity(name) {
			const normalizeMap = {
				// Mapeo para normalizar nombres
				'baleares': 'islas baleares',
				'islas baleares': 'islas baleares',
				'madrid, castilla y león': 'madrid y castilla y león',
				'asturias, cantabria, castilla y león': 'asturias, cantabria y castilla y león'
			};
			
			const lowercase = name.toLowerCase();
			return normalizeMap[lowercase] || lowercase;
		}

		// Agrupar datos de parques por comunidad autónoma normalizada
		const parksByCommunity = {};
		parksData.forEach(park => {
			const community = normalizeCommunity(park.autonomous_community);
			
			if (!parksByCommunity[community]) {
				parksByCommunity[community] = {
					totalArea: 0,
					count: 0,
					displayName: park.autonomous_community // Mantener nombre original para mostrar
				};
			}
			parksByCommunity[community].totalArea += park.current_area || 0;
			parksByCommunity[community].count += 1;
		});

		// Agrupar datos de pensiones por comunidad autónoma normalizada
		const pensionsByCommunity = {};
		pensionsData.forEach(pension => {
			// Usar "place" en lugar de "autonomous_community"
			const community = normalizeCommunity(pension.place);
			
			if (!pensionsByCommunity[community]) {
				pensionsByCommunity[community] = {
					totalAmount: 0,
					beneficiaries: 0,
					displayName: pension.place // Mantener nombre original para mostrar
				};
			}
			
			// Sumar retirement_amount + disability_amount en lugar de total_payroll_amount
			const pensionAmount = (pension.retirement_amount || 0) + (pension.disability_amount || 0);
			pensionsByCommunity[community].totalAmount += pensionAmount;
			
			// Sumar retirement_number + disability_number en lugar de beneficiaries
			const beneficiariesCount = (pension.retirement_number || 0) + (pension.disability_number || 0);
			pensionsByCommunity[community].beneficiaries += beneficiariesCount;
		});

		// Depuración para ver qué comunidades tenemos
		console.log('Comunidades en parques:', Object.keys(parksByCommunity));
		console.log('Comunidades en pensiones:', Object.keys(pensionsByCommunity));

		// Encontrar comunidades que aparecen en ambos conjuntos de datos
		const commonCommunities = Object.keys(parksByCommunity).filter(
			community => pensionsByCommunity[community]
		);
		
		console.log('Comunidades comunes:', commonCommunities);
		
		// Si no hay comunidades comunes, usar algunas para demostración
		let categoriesToUse = commonCommunities;
		if (commonCommunities.length === 0) {
			// Usar solo las comunidades de parques y mostrar valores cero para pensiones
			categoriesToUse = Object.keys(parksByCommunity);
			console.log('No hay comunidades comunes, usando solo comunidades de parques');
		}

		// Encontrar valores máximos para normalización
		const maxParksArea = Math.max(...categoriesToUse.map(community => 
			parksByCommunity[community].totalArea));
		const maxPensionAmount = Math.max(...categoriesToUse.map(community => 
			(pensionsByCommunity[community]?.totalAmount || 0)));

		// Preparar datos normalizados para el gráfico (escala 0-100)
		const categories = categoriesToUse.map(community => 
			parksByCommunity[community].displayName);
			
		const parksAreaSeries = categoriesToUse.map(community => 
			(parksByCommunity[community].totalArea / maxParksArea) * 100);
		
		const pensionAmountSeries = categoriesToUse.map(community => 
			((pensionsByCommunity[community]?.totalAmount || 0) / maxPensionAmount) * 100);
		
		return {
			categories,
			parksAreaSeries,
			pensionAmountSeries,
			// Devolver también los valores originales para el tooltip
			originalParksData: categoriesToUse.map(community => parksByCommunity[community].totalArea / 1000),
			originalPensionsData: categoriesToUse.map(community => 
				(pensionsByCommunity[community]?.totalAmount || 0) / 1000000)
		};
	}

	// Función para inicializar el gráfico de radar
	function initRadarChart() {
		if (parksData.length === 0 || pensionsData.length === 0) {
			console.error('No data available for chart');
			return;
		}

		const { categories, parksAreaSeries, pensionAmountSeries, originalParksData, originalPensionsData } = processCombinedData();

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
				text: 'Relación entre Parques Nacionales y Pensiones Sociales',
				align: 'center'
			},
			subtitle: {
				text: '(Valores normalizados para mejor visualización)',
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
				show: true,
				tickAmount: 5,
				min: 0,
				max: 100,
				labels: {
					formatter: function(val) {
						return val + '%'; // Mostrar como porcentaje
					}
				}
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
					formatter: function(val, { seriesIndex, dataPointIndex }) {
						// Mostrar el valor original en lugar del normalizado
						if (seriesIndex === 0) {
							return originalParksData[dataPointIndex].toFixed(2) + ' miles de ha';
						} else {
							return originalPensionsData[dataPointIndex].toFixed(2) + ' millones €';
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

		console.log('Inicializando gráfico con datos procesados:', { categories, parksAreaSeries, pensionAmountSeries });

		// Si los datos son insuficientes, mostrar un mensaje
		if (categories.length === 0 || !parksAreaSeries.length || !pensionAmountSeries.length) {
			console.error('Datos insuficientes para crear el gráfico');
			chartContainer.innerHTML = '<div class="error-message">No hay suficientes datos comunes para crear el gráfico</div>';
			return;
		}
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
		<a href="/graficos/national-parks">
			<button>Volver a Parques Nacionales</button>
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

	.data-sources {
		font-size: 14px;
		color: #555;
		padding: 10px;
		border-top: 1px solid #eee;
	}
</style>
