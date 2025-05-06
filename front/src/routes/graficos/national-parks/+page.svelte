<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import * as Highcharts from 'highcharts';
	import ApexCharts from 'apexcharts';
	import { dev } from '$app/environment';

	let DEVEL_HOST = 'http://localhost:16078';
	let PRODUCTION_HOST = 'https://sos2425-13.onrender.com';

	let API = '/api/v2/national-parks';
	if (dev) {
		API = DEVEL_HOST + API;
	} else {
		API = PRODUCTION_HOST + API;
	}

	let parks = [];
	let chartContainer;
	let scatterContainer;
	let apexChart;

	const colorPalette = [
		'#7cb5ec',
		'#434348',
		'#90ed7d',
		'#f7a35c',
		'#8085e9',
		'#f15c80',
		'#e4d354',
		'#84e1d7',
		'#8d4653',
		'#91e8e1',
		'#2b908f',
		'#f45b5b'
	];

	async function fetchData() {
		try {
			const resp = await fetch(API);
			if (!resp.ok) {
				console.error('Error al cargar datos:', await resp.text());
				return;
			}
			parks = await resp.json();
			console.log(`Cargados ${parks.length} parques nacionales`);
		} catch (error) {
			console.error('Error en fetchData:', error);
		}
	}

	// Función para gráfico de columnas con Highcharts (mantener como estaba)
	function initChart() {
		if (!parks || parks.length === 0) {
			console.error('No hay datos para mostrar');
			return;
		}

		// Agrupar parques por comunidad autónoma
		const communitiesMap = {};
		parks.forEach((park) => {
			if (!communitiesMap[park.autonomous_community]) {
				communitiesMap[park.autonomous_community] = [];
			}
			communitiesMap[park.autonomous_community].push(park);
		});

		// Preparar datos para el gráfico
		const communities = Object.keys(communitiesMap);
		const series = [];

		// Serie para área inicial
		const initialAreaData = communities.map((community) => {
			const parksInCommunity = communitiesMap[community];
			return {
				name: community,
				y: parksInCommunity.reduce((sum, park) => sum + park.initial_area, 0),
				color: colorPalette[communities.indexOf(community) % colorPalette.length],
				parksCount: parksInCommunity.length,
				parks: parksInCommunity.map((p) => ({
					name: p.national_park,
					year: p.declaration_date,
					initial: p.initial_area,
					current: p.current_area
				}))
			};
		});

		// Serie para área actual
		const currentAreaData = communities.map((community) => {
			const parksInCommunity = communitiesMap[community];
			return {
				name: community,
				y: parksInCommunity.reduce((sum, park) => sum + park.current_area, 0),
				color: colorPalette[communities.indexOf(community) % colorPalette.length],
				parksCount: parksInCommunity.length,
				parks: parksInCommunity.map((p) => ({
					name: p.national_park,
					year: p.declaration_date,
					initial: p.initial_area,
					current: p.current_area
				}))
			};
		});

		// Crear gráfico de columnas
		Highcharts.chart(chartContainer, {
			chart: {
				type: 'column',
				height: 700
			},
			title: {
				text: 'Áreas de Parques Nacionales por Comunidad Autónoma'
			},
			subtitle: {
				text: 'Comparativa entre áreas iniciales y actuales'
			},
			xAxis: {
				categories: communities,
				crosshair: true,
				labels: {
					rotation: -45,
					style: {
						fontSize: '12px'
					}
				}
			},
			yAxis: {
				min: 0,
				title: {
					text: 'Área (hectáreas)'
				}
			},
			tooltip: {
				useHTML: true,
				formatter: function () {
					const point = this.point;
					const seriesName = this.series.name;
					let tooltip = `<div style="max-width:300px">
            <h4 style="margin:0">${point.name}</h4>
            <hr style="margin:3px 0"/>
            <b>${seriesName}:</b> ${Highcharts.numberFormat(point.y, 0)} ha<br/>
            <b>Número de parques:</b> ${point.parksCount}<br/><br/>
            <b>Parques en esta comunidad:</b><br/>`;

					point.parks.forEach((park) => {
						tooltip += `• ${park.name} (${park.year}): ${Highcharts.numberFormat(seriesName === 'Área Inicial' ? park.initial : park.current, 0)} ha<br/>`;
					});

					tooltip += '</div>';
					return tooltip;
				}
			},
			plotOptions: {
				column: {
					pointPadding: 0.2,
					borderWidth: 0,
					grouping: true
				}
			},
			series: [
				{
					name: 'Área Inicial',
					data: initialAreaData
				},
				{
					name: 'Área Actual',
					data: currentAreaData
				}
			]
		});
	}

	// Nueva función para gráfico de dispersión con ApexCharts
	function initScatterPlot() {
		if (!parks || parks.length === 0 || !scatterContainer) {
			console.error('No hay datos o contenedor para mostrar el gráfico de dispersión');
			return;
		}

		// Filtrar parques con datos completos y válidos
		const validParks = parks.filter(
			(p) =>
				p.declaration_date != null &&
				p.initial_area != null &&
				p.current_area != null &&
				!isNaN(p.declaration_date) &&
				!isNaN(p.initial_area) &&
				!isNaN(p.current_area)
		);

		// Calcular el crecimiento de área para cada parque
		const parksWithGrowth = validParks.map((p) => ({
			...p,
			growthPercent:
				p.initial_area > 0 ? ((p.current_area - p.initial_area) / p.initial_area) * 100 : 0,
			growthAbsolute: p.current_area - p.initial_area
		}));

		// Ordenar por crecimiento absoluto y seleccionar los 10 con mayor cambio
		parksWithGrowth.sort((a, b) => Math.abs(b.growthAbsolute) - Math.abs(a.growthAbsolute));
		const selectedParks = parksWithGrowth.slice(0, 10);

		// Agrupar parques por tipo de cambio
		const growthParks = selectedParks.filter((p) => p.growthAbsolute > 0);
		const reductionParks = selectedParks.filter((p) => p.growthAbsolute < 0);
		const noChangeParks = selectedParks.filter((p) => p.growthAbsolute === 0);

		// Crear datos para cada serie con el mismo formato
		const createSeriesData = (parks, color) =>
			parks.map((park) => ({
				x: park.declaration_date,
				y: park.initial_area,
				name: park.national_park,
				community: park.autonomous_community,
				initialArea: park.initial_area,
				currentArea: park.current_area,
				growthAbs: park.growthAbsolute,
				growthPct: park.growthPercent
			}));

		const growthData = createSeriesData(growthParks);
		const reductionData = createSeriesData(reductionParks);
		const noChangeData = createSeriesData(noChangeParks);

		// Usar min/max de todos los datos para los ejes
		const allYears = selectedParks.map((p) => p.declaration_date);
		const minYear = Math.floor(Math.min(...allYears));
		const maxYear = Math.ceil(Math.max(...allYears));
		const yearRange = maxYear - minYear;

		const options = {
			series: [
				{
					name: 'Crecimiento de superficie',
					data: growthData,
					color: '#4CAF50'
				},
				{
					name: 'Reducción de superficie',
					data: reductionData,
					color: '#F44336'
				},
				{
					name: 'Sin cambio',
					data: noChangeData,
					color: '#FFC107'
				}
			],
			chart: {
				type: 'scatter',
				height: 500,
				toolbar: {
					show: false // Ocultar barra de herramientas
				},
				fontFamily: "'Arial', sans-serif",
				animations: {
					enabled: true,
					easing: 'easeinout',
					speed: 800,
					dynamicAnimation: {
						enabled: true,
						speed: 350
					}
				},
				background: '#fff',
				zoom: {
					enabled: false // Desactivar zoom completamente
				},
				redrawOnWindowResize: true,
				redrawOnParentResize: true
			},
			dataLabels: {
				enabled: true,
				formatter: function (val, opts) {
					const data = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex];
					// Limitar a 15 caracteres para evitar nombres muy largos
					return data.name.length > 15 ? data.name.substring(0, 15) + '...' : data.name;
				},
				style: {
					fontSize: '11px',
					fontFamily: 'Arial, sans-serif',
					colors: ['#333']
				},
				// Quitar el fondo gris
				background: {
					enabled: false
				},
				// Quitar efectos que causan problemas
				dropShadow: {
					enabled: false
				}
			},
			fill: {
				opacity: 0.9, // Aumentar opacidad para mejor visualización
				type: 'solid'
			},
			title: {
				text: 'Parques Nacionales: Año de Declaración vs. Superficie',
				align: 'center',
				style: {
					fontSize: '16px',
					fontWeight: 'bold'
				}
			},
			subtitle: {
				text: 'Este gráfico muestra los parques nacionales con mayores cambios de superficie desde su declaración',
				align: 'center'
			},
			grid: {
				borderColor: '#e0e0e0',
				row: {
					colors: ['transparent', 'transparent'],
					opacity: 0.2
				},
				xaxis: {
					lines: {
						show: true
					}
				},
				yaxis: {
					lines: {
						show: true
					}
				},
				padding: {
					top: 0,
					right: 10,
					bottom: 0,
					left: 10
				}
			},
			xaxis: {
				title: {
					text: 'Año de Declaración',
					style: {
						fontSize: '14px',
						fontWeight: 'normal'
					}
				},
				type: 'numeric',
				min: minYear - (yearRange > 20 ? 0 : 5), // Añadir margen si el rango es pequeño
				max: maxYear + (yearRange > 20 ? 0 : 5),
				tickAmount: Math.min(10, yearRange + 1), // No más de 10 marcas
				labels: {
					formatter: function (val) {
						// Asegurar que solo se muestren años enteros
						return Math.floor(val);
					},
					style: {
						fontSize: '12px'
					}
				},
				tooltip: {
					enabled: false
				},
				axisTicks: {
					show: true
				},
				axisBorder: {
					show: true
				}
			},
			yaxis: {
				title: {
					text: 'Superficie Inicial (ha)',
					style: {
						fontSize: '14px',
						fontWeight: 'normal'
					}
				},
				min: 0,
				labels: {
					formatter: function (val) {
						return val.toLocaleString();
					},
					style: {
						fontSize: '12px'
					}
				}
			},
			tooltip: {
				enabled: true,
				shared: false,
				intersect: true, // Cambiar a true para que solo aparezca al pasar sobre el punto
				fixed: {
					enabled: false // Deshabilitar posición fija para evitar errores
				},
				x: {
					// Simplificar la información del eje X
					show: true,
					formatter: function (val) {
						return 'Año: ' + Math.floor(val);
					}
				},
				// Simplificar el tooltip y hacerlo más robusto
				custom: function ({ series, seriesIndex, dataPointIndex, w }) {
					try {
						const data = w.config.series[seriesIndex].data[dataPointIndex];
						if (!data) return ''; // Protección contra datos indefinidos

						const color = w.config.series[seriesIndex].color || '#333';
						const growthText =
							data.growthAbs > 0
								? `+${data.growthAbs.toLocaleString()} ha (${data.growthPct.toFixed(1)}%)`
								: `${data.growthAbs.toLocaleString()} ha (${data.growthPct.toFixed(1)}%)`;

						return `
              <div class="apexcharts-tooltip-custom" style="padding:8px;background:#fff;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
                <div style="font-weight:bold;margin-bottom:5px">${data.name}</div>
                <div style="margin-bottom:3px">${data.community}</div>
                <div style="margin-top:8px">Declarado: ${data.x}</div>
                <div>Área inicial: ${data.initialArea.toLocaleString()} ha</div>
                <div>Área actual: ${data.currentArea.toLocaleString()} ha</div>
                <div style="margin-top:5px;font-weight:bold;color:${color}">Cambio: ${growthText}</div>
              </div>
            `;
					} catch (e) {
						console.log('Error en tooltip:', e);
						return '';
					}
				}
			},
			legend: {
				position: 'bottom',
				horizontalAlign: 'center'
			},
			markers: {
				// Aumentar el tamaño de los puntos para mayor visibilidad
				size: 14, // Ampliado de 10 a 14
				strokeWidth: 2, // Aumentar grosor del borde para mejor definición
				strokeColors: function (val, opts) {
					// Obtener el color de la serie actual
					const seriesIndex = opts.seriesIndex;
					return opts.w.config.series[seriesIndex].color;
				},
				hover: {
					size: 18 // Aumentar proporcionalmente el tamaño al pasar el cursor
				}
			}
		};

		// Limpiar contenedor en caso de actualización
		scatterContainer.innerHTML = '';

		// Crear gráfico de ApexCharts
		apexChart = new ApexCharts(scatterContainer, options);
		apexChart.render();

		return apexChart;
	}

	onMount(async () => {
		await fetchData();

		if (parks.length) {
			setTimeout(() => {
				console.log('Inicializando gráficos...');
				initChart();
				initScatterPlot();
			}, 100);
		}

		// Limpieza al desmontar el componente
		return () => {
			if (apexChart) {
				apexChart.destroy();
			}
		};
	});
</script>

<main>
	<h2>Visualización de Parques Nacionales de España</h2>

	<div class="button-group">
		<a href="/national-parks">
			<button>Volver a Parques Nacionales</button>
		</a>
	</div>

	<div class="chart-container">
		<div bind:this={chartContainer} class="chart-box"></div>
	</div>

	<div class="scatter-container">
		<div bind:this={scatterContainer} class="scatter-box"></div>
	</div>

	{#if parks.length === 0}
		<p class="loading">Cargando datos de parques nacionales...</p>
	{/if}
</main>

<style>
	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
	}

	h2 {
		text-align: center;
		margin: 2rem 0;
		color: #2c3e50;
	}

	.button-group {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.button-group button {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		border: none;
		border-radius: 4px;
		background-color: #a8c686;
		color: #000;
		transition: background-color 0.3s;
	}

	.button-group button:hover {
		background-color: #8ab061;
	}

	.chart-container,
	.scatter-container {
		margin: 2rem auto;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		background-color: white;
		padding: 1rem;
	}

	.chart-box {
		width: 100%;
		height: 700px;
	}

	.scatter-box {
		width: 100%;
		height: 500px;
	}

	.loading {
		text-align: center;
		font-size: 1.2rem;
		color: #666;
		padding: 2rem;
	}
</style>
