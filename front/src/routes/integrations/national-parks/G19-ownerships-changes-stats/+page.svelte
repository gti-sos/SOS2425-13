<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import ApexCharts from 'apexcharts';
	import { dev } from '$app/environment';

	// URLs para las APIs
	const PARKS_API = dev
		? 'http://localhost:16078/api/v2/national-parks'
		: 'https://sos2425-13.onrender.com/api/v2/national-parks';
	const VEHICLES_API = dev
		? 'http://localhost:16078/api/v2/proxy/ownerships-changes-stats'
		: 'https://sos2425-13.onrender.com/api/v2/proxy/ownerships-changes-stats';

	// Variables para almacenar los datos
	let parksData = [];
	let vehiclesData = [];
	let chartInstance;
	let chartContainer;
	const selectedYear = '2023'; // Año fijo para el conjunto de datos
	let loading = true;
	let error = null;

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
			error = 'Error al cargar datos de parques nacionales';
		}
	}

	// Función para obtener datos de cambios de propiedad de vehículos
	async function fetchVehiclesData() {
		try {
			const response = await fetch(VEHICLES_API);
			if (!response.ok) {
				throw new Error(`Error fetching vehicles data: ${response.status}`);
			}
			const data = await response.json();
			console.log('Vehicles data:', data);

			vehiclesData = data;
		} catch (error) {
			console.error('Failed to load vehicles data:', error);
			error = 'Error al cargar datos de cambios de propiedad de vehículos';
		}
	}

	// Función para normalizar nombres de comunidades autónomas
	function normalizeCommunity(name) {
		if (!name) return '';

		const normalizeMap = {
			andalucía: 'andalucia',
			andalucia: 'andalucia',
			'castilla-la mancha': 'castilla la mancha',
			'castilla la mancha': 'castilla la mancha',
			'castilla y león': 'castilla y leon',
			'castilla y leon': 'castilla y leon',
			'c. valenciana': 'comunidad valenciana',
			'comunidad valenciana': 'comunidad valenciana',
			'c. madrid': 'madrid',
			'comunidad de madrid': 'madrid',
			'país vasco': 'pais vasco',
			'pais vasco': 'pais vasco',
			'madrid, segovia': 'madrid'
		};

		const lowercase = name.toLowerCase();
		return normalizeMap[lowercase] || lowercase;
	}

	// Función para procesar y combinar los datos
	// Modificar la función processCombinedData() para generar datos para un heatmap
	function processCombinedData() {
		// Procesar datos de parques nacionales por comunidad
		const parksByCommunity = {};
		parksData.forEach((park) => {
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

				// Si el parque pertenece a varias comunidades, distribuir el área equitativamente
				const areaShare = park.current_area / communities.length;
				parksByCommunity[normalizedCommunity].totalArea += areaShare;
				parksByCommunity[normalizedCommunity].count += 1 / communities.length;
			});
		});

		// Procesar datos de vehículos por comunidad para el año seleccionado
		const vehiclesByCommunity = {};
		vehiclesData
			.filter((item) => item.year == selectedYear)
			.forEach((item) => {
				const community = item.autonomous_community;
				const normalizedCommunity = normalizeCommunity(community);

				if (!vehiclesByCommunity[normalizedCommunity]) {
					vehiclesByCommunity[normalizedCommunity] = {
						total: 0,
						car: 0,
						truck: 0,
						van: 0,
						bus: 0,
						motocycle: 0,
						other_vehicle: 0,
						displayName: community
					};
				}

				// Sumar cada tipo de vehículo
				vehiclesByCommunity[normalizedCommunity].car += parseInt(item.car) || 0;
				vehiclesByCommunity[normalizedCommunity].truck += parseInt(item.truck) || 0;
				vehiclesByCommunity[normalizedCommunity].van += parseInt(item.van) || 0;
				vehiclesByCommunity[normalizedCommunity].bus += parseInt(item.bus) || 0;
				vehiclesByCommunity[normalizedCommunity].motocycle += parseInt(item.motocycle) || 0;
				vehiclesByCommunity[normalizedCommunity].other_vehicle += parseInt(item.other_vehicle) || 0;

				// Calcular el total de vehículos
				vehiclesByCommunity[normalizedCommunity].total =
					vehiclesByCommunity[normalizedCommunity].car +
					vehiclesByCommunity[normalizedCommunity].truck +
					vehiclesByCommunity[normalizedCommunity].van +
					vehiclesByCommunity[normalizedCommunity].bus +
					vehiclesByCommunity[normalizedCommunity].motocycle +
					vehiclesByCommunity[normalizedCommunity].other_vehicle;
			});

		// Encontrar comunidades que aparecen en ambos conjuntos de datos
		const commonCommunities = Object.keys(parksByCommunity).filter(
			(community) => vehiclesByCommunity[community]
		);

		// Preparar series para el gráfico de heatmap
		const series = [];
		const vehicleTypes = ['car', 'truck', 'van', 'bus', 'motocycle', 'other_vehicle'];
		const vehicleLabels = {
			car: 'Turismos',
			truck: 'Camiones',
			van: 'Furgonetas',
			bus: 'Autobuses',
			motocycle: 'Motocicletas',
			other_vehicle: 'Otros vehículos'
		};

		// Para cada comunidad, crear una serie
		commonCommunities.forEach((community) => {
			const data = [];
			const displayName = parksByCommunity[community].displayName;
			const parkArea = parksByCommunity[community].totalArea;

			// Calcular valor para cada tipo de vehículo
			vehicleTypes.forEach((type) => {
				const vehicles = vehiclesByCommunity[community][type] || 0;
				// Vehículos por cada 10.000 ha (un valor más adecuado para visualización)
				const value = Math.round((vehicles / (parkArea || 1)) * 10000);

				data.push({
					x: vehicleLabels[type],
					y: value
				});
			});

			// Añadir serie solo si tiene datos
			if (data.some((item) => item.y > 0)) {
				series.push({
					name: displayName,
					data: data
				});
			}
		});

		console.log('Datos preparados para heatmap:', series);

		return {
			series,
			parksByCommunity,
			vehiclesByCommunity,
			commonCommunities,
			vehicleTypes,
			vehicleLabels
		};
	}

	// Reemplazar la función initPolarChart por initHeatmap
	function initHeatmap() {
		// Verificar que chartContainer existe antes de usarlo
		if (!chartContainer) {
			console.error('El contenedor del gráfico no está inicializado');
			return;
		}

		if (parksData.length === 0 || vehiclesData.length === 0) {
			console.error('No hay datos disponibles para el gráfico');
			chartContainer.innerHTML =
				'<div class="no-data">No hay datos disponibles para la visualización</div>';
			return;
		}

		try {
			const { series, parksByCommunity, vehiclesByCommunity, commonCommunities, vehicleLabels } =
				processCombinedData();

			// Si no hay comunidades comunes
			if (commonCommunities.length === 0) {
				chartContainer.innerHTML =
					'<div class="no-data">No hay datos comunes entre parques y vehículos</div>';
				return;
			}

			console.log('Datos para heatmap:', series);

			// Configurar opciones del heatmap
			const options = {
				series: series,
				chart: {
					height: 550,
					type: 'heatmap',
					toolbar: {
						show: true
					},
					animations: {
						enabled: true,
						easing: 'easeinout',
						speed: 800
					}
				},
				dataLabels: {
					enabled: true,
					style: {
						colors: ['#fff']
					}
				},
				colors: ['#008FFB'],
				title: {
					text: `Relación entre Parques Nacionales y Cambios de Propiedad de Vehículos`,
					align: 'center',
					style: {
						fontSize: '18px',
						fontWeight: 'bold'
					}
				},
				subtitle: {
					text: 'Vehículos por cada 10.000 hectáreas de parque nacional',
					align: 'center'
				},
				tooltip: {
					y: {
						formatter: function (val) {
							return val + ' vehículos/10.000 ha';
						}
					}
				},
				plotOptions: {
					heatmap: {
						shadeIntensity: 0.5,
						radius: 0,
						colorScale: {
							ranges: [
								{
									from: 0,
									to: 100,
									color: '#D6EAF8',
									name: 'Baja'
								},
								{
									from: 101,
									to: 500,
									color: '#85C1E9',
									name: 'Media-baja'
								},
								{
									from: 501,
									to: 1000,
									color: '#3498DB',
									name: 'Media'
								},
								{
									from: 1001,
									to: 5000,
									color: '#2874A6',
									name: 'Alta'
								},
								{
									from: 5001,
									to: 100000,
									color: '#1A5276',
									name: 'Muy alta'
								}
							]
						}
					}
				},
				stroke: {
					width: 1
				},
				xaxis: {
					title: {
						text: 'Tipo de vehículo'
					}
				},
				yaxis: {
					title: {
						text: 'Comunidad Autónoma'
					}
				}
			};

			// Limpiar el contenedor y renderizar el gráfico
			chartContainer.innerHTML = '';
			chartInstance = new ApexCharts(chartContainer, options);
			chartInstance.render();
		} catch (error) {
			console.error('Error al inicializar el gráfico:', error);
			chartContainer.innerHTML = `<div class="no-data">Error al procesar los datos: ${error.message}</div>`;
		}
	}

	// Inicializar todo al montar el componente
	onMount(async () => {
		loading = true;
		try {
			// Cargar datos en paralelo
			await Promise.all([fetchParksData(), fetchVehiclesData()]);
			loading = false;

			// Dar tiempo a que chartContainer se inicialice antes de usarlo
			setTimeout(() => {
				if (chartContainer) {
					initHeatmap(); // Llamar a la nueva función
				} else {
					console.error('El contenedor de la gráfica no está disponible después de cargar datos');
					error = 'Error al inicializar el gráfico (contenedor no disponible)';
				}
			}, 100);
		} catch (err) {
			loading = false;
			error = err.message;
			console.error('Error al cargar datos:', err);
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
	<title>Biodiversidad en Parques Nacionales - Integración con G19-ownerships-changes-stats</title>
	<meta name="description" content="Visualización de la api del grupo 19" />
</svelte:head>

<main>
	<h2>Integración: Parques Nacionales y Cambios de Propiedad de Vehículos</h2>

	<div class="button-group">
		<a href="/graficos/national-parks">
			<button>Volver a Parques Nacionales</button>
		</a>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="loading">Cargando datos...</div>
		</div>
	{:else if error}
		<div class="error-container">
			<div class="error">Error: {error}</div>
		</div>
	{:else}
		<div class="explanation">
			<p>
				Esta visualización muestra la relación entre la superficie de parques nacionales y los
				cambios de propiedad de vehículos en cada comunidad autónoma de España para el año 2023.
			</p>
			<p>
				El mapa de calor representa la <strong
					>cantidad de cada tipo de vehículo por 10.000 hectáreas de parque nacional</strong
				> en cada comunidad autónoma, permitiendo identificar patrones y diferencias regionales.
			</p>
		</div>

		<div class="chart-container" bind:this={chartContainer}>
			<!-- El gráfico se renderizará aquí -->
		</div>

		<div class="info-panel">
			<h3>¿Qué nos muestra esta integración?</h3>
			<p>
				Este gráfico nos permite analizar si existe alguna correlación entre la presencia de parques
				nacionales y los patrones de propiedad de diferentes tipos de vehículos en cada comunidad
				autónoma.
			</p>
			<p>
				Por ejemplo, podemos observar si las comunidades con mayor superficie de parques nacionales
				tienden a tener diferentes preferencias en cuanto a los tipos de vehículos (como más
				vehículos todo terreno o más turismos).
			</p>
			<p>
				La densidad (vehículos por hectárea de parque) nos ayuda a normalizar la comparación entre
				comunidades de diferentes tamaños y con diferente número de parques.
			</p>
		</div>

		<div class="sources">
			<h4>Fuentes de datos:</h4>
			<ul>
				<li>Parques Nacionales: API del Grupo 13 (SOS2425-13)</li>
				<li>Cambios de Propiedad de Vehículos: API del Grupo 19 (SOS2425-19)</li>
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
		height: 550px;
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

	.info-panel {
		background-color: #f5f5f5;
		padding: 20px;
		border-radius: 8px;
		margin-bottom: 20px;
	}

	.info-panel h3 {
		color: #2c5e2e;
		margin-top: 0;
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
</style>
