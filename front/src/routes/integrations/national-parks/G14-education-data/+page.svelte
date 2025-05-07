<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import ApexCharts from 'apexcharts';
	import { dev } from '$app/environment';

	// URLs para las APIs
	const PARKS_API = dev
		? 'http://localhost:16078/api/v2/national-parks'
		: 'https://sos2425-13.onrender.com/api/v2/national-parks';
	const EDUCATION_API = dev
		? 'http://localhost:16078/api/v2/proxy/education-data'
		: 'https://sos2425-13.onrender.com/api/v2/proxy/education-data';

	// Variables para almacenar los datos
	let parksData = [];
	let educationData = [];
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

	// Función para obtener datos educativos
	async function fetchEducationData() {
		try {
			const response = await fetch(EDUCATION_API);
			if (!response.ok) {
				throw new Error(`Error fetching education data: ${response.status}`);
			}
			const data = await response.json();
			console.log('Education data:', data);
			// Mostrar estructura detallada para debug
			if (data.length > 0) {
				console.log('Estructura de un elemento de educación:', data[0]);
				console.log('Campos disponibles:', Object.keys(data[0]));
			}
			educationData = data;
		} catch (error) {
			console.error('Failed to load education data:', error);
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
				'asturias, cantabria, castilla y león': 'asturias'
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

		// Agrupar datos educativos por comunidad
		const educationByCommunity = {};
		educationData.forEach((edu) => {
			// Extraer la comunidad autónoma
			const community = edu.autonomous_community || '';
			if (!community || community.toLowerCase() === 'total') return; // Ignorar totales
			
			const normalizedCommunity = normalizeCommunity(community);
			
			if (!educationByCommunity[normalizedCommunity]) {
				educationByCommunity[normalizedCommunity] = {
					totalHigherGrade: 0,
					totalMiddleGrade: 0,
					count: 0,
					yearData: {},
					displayName: community
				};
			}
			
			// Usar higher_grade como indicador de graduación y middle_grade para complementar
			const higherGradeValue = parseFloat(edu.higher_grade || 0);
			const middleGradeValue = parseFloat(edu.middle_grade || 0);
			
			console.log(`Comunidad: ${community}, Higher Grade: ${higherGradeValue}, Middle Grade: ${middleGradeValue}`);
			
			educationByCommunity[normalizedCommunity].totalHigherGrade += isNaN(higherGradeValue) ? 0 : higherGradeValue;
			educationByCommunity[normalizedCommunity].totalMiddleGrade += isNaN(middleGradeValue) ? 0 : middleGradeValue;
			educationByCommunity[normalizedCommunity].count += 1;
			
			// Guardar por año
			const year = edu.year || 2020;
			if (!educationByCommunity[normalizedCommunity].yearData[year]) {
				educationByCommunity[normalizedCommunity].yearData[year] = {
					higherGrade: 0,
					middleGrade: 0,
					count: 0
				};
			}
			
			educationByCommunity[normalizedCommunity].yearData[year].higherGrade += isNaN(higherGradeValue) ? 0 : higherGradeValue;
			educationByCommunity[normalizedCommunity].yearData[year].middleGrade += isNaN(middleGradeValue) ? 0 : middleGradeValue;
			educationByCommunity[normalizedCommunity].yearData[year].count += 1;
		});
		
		// Log para depuración
		console.log('Comunidades en parques:', Object.keys(parksByCommunity));
		console.log('Comunidades en educación:', Object.keys(educationByCommunity));
		console.log('Datos educativos procesados:', educationByCommunity);
		
		// Encontrar comunidades que aparecen en ambos conjuntos de datos
		const commonCommunities = Object.keys(parksByCommunity).filter(
			(community) => educationByCommunity[community]
		);
		
		console.log('Comunidades comunes:', commonCommunities);
		
		// Preparar datos para el gráfico de treemap
		const treeData = [];
		
		commonCommunities.forEach((community) => {
			// Calcular promedios educativos
			const educationInfo = educationByCommunity[community];
			const avgHigherGrade = educationInfo.count > 0 ? 
				educationInfo.totalHigherGrade / educationInfo.count : 0;
			const avgMiddleGrade = educationInfo.count > 0 ? 
				educationInfo.totalMiddleGrade / educationInfo.count : 0;
			
			// Usar higher_grade como indicador principal para el color
			treeData.push({
				x: parksByCommunity[community].displayName,
				y: parksByCommunity[community].totalArea / 1000, // En miles de hectáreas
				higherGrade: avgHigherGrade.toFixed(2),
				middleGrade: avgMiddleGrade.toFixed(2),
				fillColor: getColorByRate(avgHigherGrade)
			});
		});
		
		// Ordenar por tamaño para mejor visualización
		treeData.sort((a, b) => b.y - a.y);
		
		return {
			treeData,
			commonCommunities,
			educationByCommunity // ¡IMPORTANTE! Devolver esto para usarlo en initTreemapChart
		};
	}

	// Función para asignar color según tasa de graduación
	function getColorByRate(rate) {
		// Colores más saturados y contrastados
		if (rate >= 60) return '#005000'; // Verde muy oscuro para tasas muy altas
		if (rate >= 50) return '#007300'; // Verde oscuro para tasas altas
		if (rate >= 40) return '#00A000'; // Verde para tasas medias-altas
		if (rate >= 30) return '#00E000'; // Verde brillante para tasas medias
		if (rate >= 20) return '#E67700'; // Naranja fuerte para tasas medias-bajas
		if (rate >= 10) return '#CC3300'; // Rojo-naranja para tasas bajas
		return '#990000'; // Rojo oscuro para tasas muy bajas
	}

	// Función para inicializar el gráfico de treemap
	function initTreemapChart() {
		if (parksData.length === 0 || educationData.length === 0) {
			console.error('No data available for chart');
			return;
		}
		
		const { treeData, commonCommunities, educationByCommunity } = processCombinedData();
		
		// Si no hay suficientes datos, mostrar un mensaje
		if (treeData.length === 0) {
			chartContainer.innerHTML = '<div class="no-data">No hay suficientes datos comunes entre parques nacionales y datos educativos</div>';
			return;
		}
		
		// Verificar si tenemos datos educativos válidos
		let hasValidEducationData = false;
		for (const community of Object.keys(educationByCommunity)) {
			const avgHigherGrade = educationByCommunity[community].count > 0 
				? educationByCommunity[community].totalHigherGrade / educationByCommunity[community].count 
				: 0;
				
			if (avgHigherGrade > 0) {
				hasValidEducationData = true;
				break;
			}
		}
		
		// Si no hay datos válidos de educación, usar una visualización diferente
		if (!hasValidEducationData) {
			console.log('No hay datos válidos de tasas educativas, cambiando a visualización alternativa');

			// Usar un pie chart para mostrar distribución de parques por comunidad
			const pieData = [];
			for (const community in parksByCommunity) {
				pieData.push({
					name: parksByCommunity[community].displayName,
					value: parksByCommunity[community].totalArea / 1000
				});
			}

			// Ordenar y limitar a las 10 comunidades con más área
			pieData.sort((a, b) => b.value - a.value);
			const topCommunities = pieData.slice(0, 10);

			const options = {
				series: topCommunities.map((item) => item.value),
				chart: {
					height: 550,
					type: 'donut'
				},
				labels: topCommunities.map((item) => item.name),
				title: {
					text: 'Distribución de Parques Nacionales por Comunidad Autónoma',
					align: 'center',
					style: {
						fontSize: '16px'
					}
				},
				subtitle: {
					text: '(No se encontraron datos educativos válidos)',
					align: 'center'
				},
				plotOptions: {
					pie: {
						donut: {
							size: '50%',
							labels: {
								show: true,
								total: {
									show: true,
									label: 'Superficie Total',
									formatter: function (w) {
										return (
											w.globals.seriesTotals.reduce((a, b) => a + b, 0).toFixed(2) + ' miles ha'
										);
									}
								}
							}
						}
					}
				},
				dataLabels: {
					enabled: true,
					formatter: function (val, opts) {
						return opts.w.globals.labels[opts.seriesIndex] + ': ' + val.toFixed(1) + '%';
					}
				},
				legend: {
					position: 'bottom',
					horizontalAlign: 'center'
				}
			};

			// Limpiar y renderizar
			chartContainer.innerHTML = '';
			chartInstance = new ApexCharts(chartContainer, options);
			chartInstance.render();

			return;
		}

		// Configuración del gráfico de treemap
		const options = {
			series: [
				{
					data: treeData
				}
			],
			chart: {
				height: 550,
				type: 'treemap',
				toolbar: {
					show: true
				}
			},
			title: {
				text: 'Relación entre Parques Nacionales y Educación por CCAA',
				align: 'center',
				style: {
					fontSize: '16px'
				}
			},
			subtitle: {
				text: 'Tamaño = Superficie de parques (miles de hectáreas) | Color = Tasa de graduación',
				align: 'center'
			},
			plotOptions: {
				treemap: {
					distributed: true,
					enableShades: false,
					// Configuración mejorada para el efecto hover
					highlightEnabled: true,
					colorScale: {
						ranges: [
							{
								from: 0,
								to: 10,
								color: '#990000' // Rojo oscuro
							},
							{
								from: 10.1,
								to: 20,
								color: '#CC3300' // Rojo-naranja
							},
							{
								from: 20.1,
								to: 30,
								color: '#E67700' // Naranja fuerte
							},
							{
								from: 30.1,
								to: 40,
								color: '#00E000' // Verde brillante
							},
							{
								from: 40.1,
								to: 50,
								color: '#00A000' // Verde
							},
							{
								from: 50.1,
								to: 60, 
								color: '#007300' // Verde oscuro
							},
							{
								from: 60.1,
								to: 100,
								color: '#005000' // Verde muy oscuro
							}
						]
					},
					// Añadir estas nuevas configuraciones para el efecto hover
					states: {
						hover: {
							filter: {
								type: 'none' // Desactivar el filtro por defecto que hace que se vuelva blanco
							},
							borderColor: '#000000', // Borde negro cuando se pasa el cursor
							borderWidth: 2, // Ancho del borde al pasar cursor
						},
						active: {
							filter: {
								type: 'darken',
								value: 0.15 // Oscurecer ligeramente en lugar de aclarar
							}
						}
					}
				}
			},
			tooltip: {
				custom: function ({ seriesIndex, dataPointIndex, w }) {
					const data = w.config.series[seriesIndex].data[dataPointIndex];
					return `
          <div class="custom-tooltip">
            <div class="header">${data.x}</div>
            <div class="detail">
              <span class="label">Superficie de parques:</span>
              <span class="value">${data.y.toFixed(2)} miles ha</span>
            </div>
            <div class="detail">
              <span class="label">FP Grado Superior:</span>
              <span class="value">${data.higherGrade}%</span>
            </div>
            <div class="detail">
              <span class="label">FP Grado Medio:</span>
              <span class="value">${data.middleGrade}%</span>
            </div>
          </div>
          `;
				}
			},
			dataLabels: {
				enabled: true,
				style: {
					fontSize: '12px',
					fontFamily: 'Arial, sans-serif',
					fontWeight: 'bold',
					colors: ['#ffffff'] // Texto blanco para mayor contraste
				},
				formatter: function(text, op) {
					return text;
				},
				dropShadow: {
					enabled: true,
					top: 1,
					left: 1,
					blur: 1,
					color: '#000000',
					opacity: 0.5
				}
			},
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
		await Promise.all([fetchParksData(), fetchEducationData()]);

		// Inicializar el gráfico cuando tenemos ambos conjuntos de datos
		if (parksData.length > 0 && educationData.length > 0) {
			initTreemapChart();
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
	<h2>Integración: Parques Nacionales y Datos Educativos</h2>

	<div class="button-group">
		<a href="/graficos/national-parks">
			<button>Volver a Parques Nacionales</button>
		</a>
	</div>

	<div class="explanation">
		<p>
			Este gráfico muestra la relación entre la superficie de parques nacionales y las estadísticas
			educativas por comunidad autónoma.
		</p>
		<p>
			El <strong>tamaño</strong> de cada bloque representa la superficie total de parques nacionales
			(en miles de hectáreas), mientras que el <strong>color</strong> representa la tasa de graduación
			educativa.
		</p>
	</div>

	<div class="chart-container" bind:this={chartContainer}>
		<!-- El gráfico se renderizará aquí -->
		{#if !parksData.length || !educationData.length}
			<div class="loading">Cargando datos...</div>
		{/if}
	</div>

	<div class="data-sources">
		<h3>Fuentes de datos:</h3>
		<ul>
			<li>Parques Nacionales: API del Grupo 13 (SOS2425-13)</li>
			<li>Datos Educativos: API del Grupo 14 (SOS2425-14)</li>
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
		height: 550px;
		margin: 30px 0 10px 0;
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
		margin-top: 20px;
	}

	:global(.custom-tooltip) {
		background: white;
		border: 1px solid #eee;
		padding: 10px;
		border-radius: 5px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		min-width: 200px;
	}

	:global(.custom-tooltip .header) {
		font-weight: bold;
		border-bottom: 1px solid #eee;
		padding-bottom: 5px;
		margin-bottom: 5px;
		font-size: 14px;
		color: #333;
	}

	:global(.custom-tooltip .detail) {
		display: flex;
		justify-content: space-between;
		margin: 4px 0;
		font-size: 13px;
	}

	:global(.custom-tooltip .label) {
		color: #666;
	}

	:global(.custom-tooltip .value) {
		font-weight: bold;
		color: #333;
	}
</style>
