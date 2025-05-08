<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import ApexCharts from 'apexcharts';
	import { dev } from '$app/environment';

	// URLs para las APIs
	const PARKS_API = dev
		? 'http://localhost:16078/api/v2/national-parks'
		: 'https://sos2425-13.onrender.com/api/v2/national-parks';
	const DANA_API = dev
		? 'http://localhost:16078/api/v2/proxy/dana-grants-subsidies-stats'
		: 'https://sos2425-13.onrender.com/api/v2/proxy/dana-grants-subsidies-stats';

	// Variables para almacenar los datos
	let parksData = [];
	let danaData = [];
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

	// Función para obtener datos de subvenciones DANA
	async function fetchDanaData() {
		try {
			const response = await fetch(DANA_API);
			if (!response.ok) {
				throw new Error(`Error fetching DANA grants data: ${response.status}`);
			}
			const data = await response.json();
			console.log('DANA grants data:', data);
			if (data.length > 0) {
				console.log('Estructura de subvención DANA:', data[0]);
				console.log('Campos disponibles:', Object.keys(data[0]));
			}
			danaData = data;
		} catch (error) {
			console.error('Failed to load DANA grants data:', error);
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
				'madrid, castilla y león': 'castilla y leon',
				'castilla y león': 'castilla y leon',
				'castilla y leon': 'castilla y leon',
				'illes balears': 'baleares',
				'islas baleares': 'baleares',
				baleares: 'baleares',
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

		// Agrupar datos de parques por comunidad
		const parksByCommunity = {};
		parksData.forEach((park) => {
			const communities = park.autonomous_community.split(',').map((c) => c.trim());

			communities.forEach((community) => {
				const normalizedCommunity = normalizeCommunity(community);

				if (!parksByCommunity[normalizedCommunity]) {
					parksByCommunity[normalizedCommunity] = {
						totalArea: 0,
						count: 0,
						parks: [],
						displayName: community
					};
				}

				// Distribuir el área equitativamente si el parque pertenece a varias comunidades
				const areaShare = park.current_area / communities.length;
				parksByCommunity[normalizedCommunity].totalArea += areaShare;
				parksByCommunity[normalizedCommunity].count += 1 / communities.length;
				parksByCommunity[normalizedCommunity].parks.push({
					name: park.national_park,
					area: areaShare,
					year: park.declaration_date
				});
			});
		});

		// Agrupar datos de subvenciones DANA por año y propósito
		const danaByYear = {};
		const danaPurposes = new Set();

		// Primero verificamos si hay datos
		if (!danaData || danaData.length === 0) {
			console.log('No hay datos de subvenciones DANA para procesar');
			return {
				bubbleData: [],
				parksByCommunity: {},
				danaByYear: {},
				purposes: [],
				years: []
			};
		}

		// Obtener los años para estar seguros que existen
		const availableYears = new Set();

		danaData.forEach((grant) => {
			// Asegurarse de que year es un número válido
			const year = parseInt(grant.year);
			if (!isNaN(year)) {
				availableYears.add(year);
			}
		});

		// Inicializar estructura para todos los años disponibles antes de procesar
		Array.from(availableYears).forEach((year) => {
			danaByYear[year] = {
				totalGranted: 0,
				totalPaid: 0,
				purposes: {},
				provinceDistribution: {}
			};
		});

		// Ahora procesar los datos con seguridad
		danaData.forEach((grant) => {
			// Extraer año y propósito con comprobaciones de seguridad
			const year = parseInt(grant.year);
			if (isNaN(year)) {
				console.log('Registro con año no válido:', grant);
				return; // Saltar este registro
			}

			const purpose = grant.purpose || 'No especificado';
			danaPurposes.add(purpose);

			// Verificar que el año ya está inicializado
			if (!danaByYear[year]) {
				console.log(
					`Inicializando estructura para el año ${year} que no fue detectado inicialmente`
				);
				danaByYear[year] = {
					totalGranted: 0,
					totalPaid: 0,
					purposes: {},
					provinceDistribution: {}
				};
			}

			// Sumar importes con validación
			const amtGranted = parseFloat(grant.amt_granted) || 0;
			const amtPaid = parseFloat(grant.amt_paid) || 0;

			danaByYear[year].totalGranted += amtGranted;
			danaByYear[year].totalPaid += amtPaid;

			// Agrupar por propósito
			if (!danaByYear[year].purposes[purpose]) {
				danaByYear[year].purposes[purpose] = {
					granted: 0,
					paid: 0
				};
			}
			danaByYear[year].purposes[purpose].granted += amtGranted;
			danaByYear[year].purposes[purpose].paid += amtPaid;

			// Agrupar por provincia
			const province = grant.prov_name || 'No especificada';
			if (!danaByYear[year].provinceDistribution[province]) {
				danaByYear[year].provinceDistribution[province] = {
					granted: 0,
					paid: 0
				};
			}
			danaByYear[year].provinceDistribution[province].granted += amtGranted;
			danaByYear[year].provinceDistribution[province].paid += amtPaid;
		});

		// Añadir logging de diagnóstico
		console.log('Años de subvenciones procesados:', Object.keys(danaByYear));
		console.log(
			'Ejemplo de datos procesados para un año:',
			Object.keys(danaByYear).length > 0 ? danaByYear[Object.keys(danaByYear)[0]] : 'No hay datos'
		);

		// Ordenar propósitos por importe total para análisis
		const sortedPurposes = Array.from(danaPurposes).sort();

		// Crear series de datos para el gráfico de burbuja
		const bubbleData = [];
		const years = Object.keys(danaByYear).map((y) => parseInt(y));

		// Años para el análisis de parques, debe incluir los años de las subvenciones
		const parkYears = [...new Set([...parksData.map((p) => p.declaration_date), ...years])].sort();

		// Acumular áreas de parques por año (sumando declaraciones previas)
		const accumulatedParksByYear = {};
		const parkCommunitiesByYear = {};

		parkYears.forEach((year) => {
			accumulatedParksByYear[year] = 0;
			parkCommunitiesByYear[year] = new Set();

			// Para cada parque, acumular su área si fue declarado en este año o antes
			parksData.forEach((park) => {
				if (park.declaration_date <= year) {
					const communities = park.autonomous_community.split(',').map((c) => c.trim());
					communities.forEach((community) => {
						parkCommunitiesByYear[year].add(normalizeCommunity(community));
						accumulatedParksByYear[year] += park.current_area / communities.length;
					});
				}
			});
		});

		// Normalizar los valores de Z (tamaño de burbuja) para evitar valores extremos
		function normalizeZValue(parkArea) {
			// Si es un área muy pequeña, darle un valor mínimo para visibilidad
			if (parkArea < 1) return 10;

			// Para áreas normales, hacer una escala semilogarítmica más visible
			return 10 + Math.log(parkArea + 1) * 5;
		}

		// Para cada año con datos DANA, crear una burbuja
		years.forEach((year) => {
			const danaInfo = danaByYear[year];
			const danaAmount = danaInfo.totalGranted / 1000000; // En millones de euros
			const parkArea = accumulatedParksByYear[year] ? accumulatedParksByYear[year] / 1000 : 0; // En miles de hectáreas
			const numCommunities = parkCommunitiesByYear[year] ? parkCommunitiesByYear[year].size : 0;

			// Calcular porcentaje por propósito principal
			let topPurpose = 'No especificado';
			let topAmount = 0;

			Object.entries(danaInfo.purposes).forEach(([purpose, amounts]) => {
				if (amounts.granted > topAmount) {
					topAmount = amounts.granted;
					topPurpose = purpose;
				}
			});

			// Identificar provincias principales
			const provinces = Object.keys(danaInfo.provinceDistribution).join(', ');

			bubbleData.push({
				x: year, // Año en eje X
				y: danaAmount, // Importe de subvenciones en eje Y
				z: normalizeZValue(parkArea), // Usar el valor normalizado aquí
				parkArea, // Mantener el valor original para el tooltip
				danaAmount, // Para mostrar en tooltip
				communities: numCommunities, // Número de comunidades con parques
				provinces, // Provincias con subvenciones
				topPurpose, // Propósito principal
				year // Año
			});
		});

		return {
			bubbleData,
			parksByCommunity,
			danaByYear,
			purposes: sortedPurposes,
			years
		};
	}

	// Función para inicializar el gráfico
	function initBubbleChart() {
		if (parksData.length === 0 || danaData.length === 0) {
			console.error('No data available for chart');
			if (chartContainer) {
				chartContainer.innerHTML =
					'<div class="no-data">No hay datos disponibles para la visualización</div>';
			}
			return;
		}

		try {
			// Capturar el objeto devuelto por processCombinedData
			const { bubbleData, parksByCommunity, danaByYear, purposes, years } = processCombinedData();

			// Si no hay datos suficientes
			if (bubbleData.length === 0) {
				chartContainer.innerHTML =
					'<div class="no-data">No hay suficientes datos comunes para la visualización</div>';
				return;
			}

			console.log('Datos para el gráfico de burbujas:', bubbleData);

			// Configurar el gráfico de burbujas
			const options = {
				series: [
					{
						name: 'Parques y Subvenciones DANA',
						data: bubbleData
					}
				],
				chart: {
					height: 550,
					type: 'bubble',
					animations: {
						enabled: true,
						speed: 800
					},
					toolbar: {
						show: true,
						tools: {
							download: true,
							selection: false,
							zoom: false,
							zoomin: false,
							zoomout: false,
							pan: false,
							reset: false // Deshabilitar también el reset
						}
					},
					// Añadir esta configuración para desactivar completamente el zoom
					zoom: {
						enabled: false
					}
				},
				colors: ['#4dabf5'], // Azul más agradable
				fill: {
					opacity: 0.8,
					type: 'solid' // Cambiar a sólido para mejor visibilidad
				},
				title: {
					text: 'Relación entre Parques Nacionales y Subvenciones DANA',
					align: 'center',
					style: {
						fontSize: '18px',
						fontWeight: 'bold'
					}
				},
				subtitle: {
					text: 'Tamaño de burbuja = Superficie acumulada de parques (miles ha)',
					align: 'center'
				},
				xaxis: {
					title: {
						text: 'Año'
					},
					tickAmount: Math.min(10, years.length),
					type: 'numeric',
					min: Math.min(...years) - 1, // Fijar límites
					max: Math.max(...years) + 1,
					labels: {
						formatter: function (val) {
							return val.toFixed(0);
						}
					}
				},
				yaxis: {
					title: {
						text: 'Subvenciones DANA (millones €)'
					},
					min: 0, // Nunca mostrar valores negativos
					labels: {
						formatter: function (val) {
							return val.toFixed(2) + ' M€';
						}
					}
				},
				markers: {
					size: [10, 40], // Aumentar tamaño mínimo y máximo
					strokeWidth: 2,
					strokeColors: '#fff',
					hover: {
						size: 20,
						sizeOffset: 5 // Aumentar para mejor visibilidad
					}
				},
				legend: {
					show: false
				},
				tooltip: {
					enabled: true,
					theme: 'dark',
					shared: false,
					intersect: true,
					fixed: {
						enabled: true, // Tooltip fijo
						position: 'topRight',
						offsetY: 0
					},
					custom: function ({ seriesIndex, dataPointIndex, w }) {
						try {
							// Acceso más seguro a los datos
							if (!w || !w.globals || !w.globals.series) {
								return `<div class="bubble-tooltip">Datos no disponibles</div>`;
							}

							// Obtener los datos
							const year = bubbleData[dataPointIndex]?.x || 'N/A';
							const danaAmount = bubbleData[dataPointIndex]?.y || 0;
							const parkArea = bubbleData[dataPointIndex]?.parkArea || 0;
							const communities = bubbleData[dataPointIndex]?.communities || 'N/A';
							const topPurpose = bubbleData[dataPointIndex]?.topPurpose || 'No especificado';
							const provinces = bubbleData[dataPointIndex]?.provinces || 'No especificado';

							return `
                  <div class="bubble-tooltip">
                    <div class="bubble-tooltip-header">Año ${year}</div>
                    <div class="bubble-tooltip-row">
                      <span class="bubble-tooltip-label">Subvenciones DANA:</span>
                      <span class="bubble-tooltip-value">${danaAmount.toFixed(2)} millones €</span>
                    </div>
                    <div class="bubble-tooltip-row">
                      <span class="bubble-tooltip-label">Superficie de parques:</span>
                      <span class="bubble-tooltip-value">${parkArea.toFixed(2)} miles ha</span>
                    </div>
                    <div class="bubble-tooltip-row">
                      <span class="bubble-tooltip-label">Comunidades con parques:</span>
                      <span class="bubble-tooltip-value">${communities}</span>
                    </div>
                    <div class="bubble-tooltip-row">
                      <span class="bubble-tooltip-label">Principal propósito:</span>
                      <span class="bubble-tooltip-value">${topPurpose}</span>
                    </div>
                    <div class="bubble-tooltip-footer">
                      <span>${provinces}</span>
                    </div>
                  </div>
                `;
						} catch (err) {
							console.error('Error en tooltip:', err);
							return `<div class="bubble-tooltip">Error al mostrar datos</div>`;
						}
					}
				},
				dataLabels: {
					enabled: false // Deshabilitar completamente las etiquetas
				}
			};

			// Limpiar y renderizar el gráfico
			chartContainer.innerHTML = '';
			chartInstance = new ApexCharts(chartContainer, options);
			chartInstance.render();

			// Logs para depuración
			console.log('Estructura de datos de burbuja:', bubbleData[0]);
			console.log(
				'Rango de valores z:',
				Math.min(...bubbleData.map((d) => d.z)),
				'-',
				Math.max(...bubbleData.map((d) => d.z))
			);
			console.log(
				'Rango de valores y:',
				Math.min(...bubbleData.map((d) => d.y)),
				'-',
				Math.max(...bubbleData.map((d) => d.y))
			);
		} catch (error) {
			console.error('Error al inicializar el gráfico:', error);
			chartContainer.innerHTML = `<div class="no-data">Error al procesar los datos: ${error.message}</div>`;
		}
	}

	// Inicializar todo al montar el componente
	onMount(async () => {
		try {
			// Cargar datos en paralelo
			await Promise.all([fetchParksData(), fetchDanaData()]);

			// Verificar si los datos se cargaron correctamente e inicializar el gráfico
			if (parksData.length > 0 && danaData.length > 0) {
				initBubbleChart();
			} else {
				console.error('No se pudieron cargar los datos');
				if (chartContainer) {
					chartContainer.innerHTML =
						'<div class="no-data">No se pudieron cargar los datos necesarios</div>';
				}
			}
		} catch (error) {
			console.error('Error general:', error);
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
	<h2>Integración: Parques Nacionales y Subvenciones DANA</h2>

	<div class="button-group">
		<a href="/graficos/national-parks">
			<button>Volver a Parques Nacionales</button>
		</a>
	</div>

	<div class="explanation">
		<p>
			Esta visualización muestra la relación entre la superficie acumulada de parques nacionales y
			las subvenciones DANA (Daños por Adversidades Naturales y Acontecimientos) a lo largo del
			tiempo.
		</p>
		<p class="explanation-details">
			<span class="legend-item"><strong>Eje X</strong>: Año</span>
			<span class="legend-item"
				><strong>Eje Y</strong>: Importe total de subvenciones DANA (millones €)</span
			>
			<span class="legend-item"
				><strong>Tamaño de burbuja</strong>: Superficie acumulada de parques (miles ha)</span
			>
		</p>
	</div>

	<div class="chart-container" bind:this={chartContainer}>
		<!-- El gráfico se renderizará aquí -->
		{#if !parksData.length || !danaData.length}
			<div class="loading">Cargando datos...</div>
		{/if}
	</div>

	<div class="info-panel">
		<h3>Sobre los datos</h3>
		<p>
			Los datos de subvenciones DANA corresponden principalmente a la provincia de Alicante,
			mientras que los parques nacionales están distribuidos por toda España. Esta visualización
			muestra cómo se correlacionan las ayudas para desastres naturales con la superficie protegida
			como parque nacional.
		</p>
		<p>
			Al pasar el cursor sobre cada burbuja, podrás ver información detallada sobre las
			subvenciones, propósito principal y el número de comunidades autónomas que tienen parques
			nacionales en ese año.
		</p>
	</div>

	<div class="sources">
		<h4>Fuentes de datos:</h4>
		<ul>
			<li>Parques Nacionales: API del Grupo 13 (SOS2425-13)</li>
			<li>Subvenciones DANA: API del Grupo 18 (SOS2425-18)</li>
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

	.explanation-details {
		display: flex;
		flex-wrap: wrap;
		gap: 15px;
		margin-top: 15px;
	}

	.legend-item {
		background-color: rgba(58, 150, 71, 0.1);
		padding: 6px 12px;
		border-radius: 20px;
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

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 18px;
		color: #666;
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
        content: "•";
        color: #3a9647;
        font-weight: bold;
        position: absolute;
        left: 0;
    }


	:global(.bubble-tooltip) {
		background-color: rgba(33, 33, 33, 0.95) !important;
		padding: 12px !important;
		border-radius: 5px !important;
		min-width: 250px !important;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5) !important;
		z-index: 1000 !important;
		color: white !important;
		pointer-events: auto !important;
		border: 1px solid rgba(255, 255, 255, 0.2) !important;
	}

	:global(.bubble-tooltip-header) {
		color: #ffffff !important;
		font-weight: bold !important;
		font-size: 16px !important;
		margin-bottom: 8px !important;
		padding-bottom: 8px !important;
		border-bottom: 1px solid rgba(255, 255, 255, 0.3) !important;
	}

	:global(.bubble-tooltip-row) {
		display: flex;
		justify-content: space-between;
		margin: 5px 0;
	}

	:global(.bubble-tooltip-label) {
		color: rgba(255, 255, 255, 0.7);
	}

	:global(.bubble-tooltip-value) {
		color: #ffffff;
		font-weight: 500;
	}

	:global(.bubble-tooltip-footer) {
		margin-top: 8px;
		padding-top: 8px;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		font-style: italic;
	}

	:global(.apexcharts-tooltip) {
		opacity: 1 !important;
		z-index: 1000 !important;
	}
</style>
