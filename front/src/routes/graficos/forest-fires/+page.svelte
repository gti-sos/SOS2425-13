<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import * as Highcharts from 'highcharts';
	import ApexCharts from 'apexcharts';
	import { dev } from '$app/environment';

	let DEVEL_HOST = 'http://localhost:16078';
	let PRODUCTION_HOST = 'https://sos2425-13.onrender.com'; 
	let API = '/api/v1/forest-fires';
	if (dev) API = DEVEL_HOST + API;
	else API = PRODUCTION_HOST + API;

	let fires = [];
	let chartContainer;
	let scatterContainer;

	const colorPalette = ['#7cb5ec','#f15c80','#90ed7d','#f7a35c','#8085e9','#e4d354','#2b908f','#8d4653','#91e8e1'];

	async function fetchData() {
		try {
			const res = await fetch(API);
			if (!res.ok) {
				console.error('Error al cargar datos:', await res.text());
				return;
			}
			fires = await res.json();
			console.log(`Cargados ${fires.length} registros de incendios`);
			initColumnChart();
			initScatterPlot();
		} catch (error) {
			console.error('Error al obtener datos:', error);
		}
	}

	function initColumnChart() {
		if (!fires || fires.length === 0) return;

		const map = {};
		fires.forEach(f => {
			if (!map[f.autonomous_community]) map[f.autonomous_community] = [];
			map[f.autonomous_community].push(f);
		});

		const communities = Object.keys(map);
		const totalAccidents = communities.map((com) => ({
			name: com,
			y: map[com].reduce((sum, f) => sum + f.accidents, 0),
			color: colorPalette[communities.indexOf(com) % colorPalette.length]
		}));

		const bigFiresAvg = communities.map((com) => ({
			name: com,
			y: map[com].reduce((sum, f) => sum + f.big_fires_pct, 0) / map[com].length,
			color: colorPalette[communities.indexOf(com) % colorPalette.length]
		}));

		Highcharts.chart(chartContainer, {
			chart: { type: 'column', height: 600 },
			title: { text: 'Incendios forestales por comunidad' },
			xAxis: {
				categories: communities,
				labels: { rotation: -45, style: { fontSize: '12px' } }
			},
			yAxis: [{ title: { text: 'Accidentes' } }],
			tooltip: {
				shared: true,
				useHTML: true
			},
			series: [
				{ name: 'Total accidentes', data: totalAccidents },
				{ name: 'Promedio % incendios grandes', data: bigFiresAvg }
			]
		});
	}

	function initScatterPlot() {
		if (!fires || fires.length === 0 || !scatterContainer) return;

		const scatterData = fires.map(f => ({
			x: f.year,
			y: f.accidents,
			name: f.autonomous_community,
			bigPct: f.big_fires_pct
		}));

		const options = {
			series: [{
				name: 'Accidentes por año',
				data: scatterData,
				color: '#F44336'
			}],
			chart: {
				type: 'scatter',
				height: 500,
				zoom: { enabled: false }
			},
			xaxis: {
				title: { text: 'Año' },
				type: 'numeric'
			},
			yaxis: {
				title: { text: 'Número de accidentes' }
			},
			dataLabels: {
				enabled: true,
				formatter: (val, opts) => opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].name
			},
			tooltip: {
				custom: ({ series, seriesIndex, dataPointIndex, w }) => {
					const point = w.config.series[seriesIndex].data[dataPointIndex];
					return `
						<div>
							<strong>${point.name}</strong><br/>
							Año: ${point.x}<br/>
							Accidentes: ${point.y}<br/>
							% Inc. grandes: ${point.bigPct}%
						</div>`;
				}
			}
		};

		const chart = new ApexCharts(scatterContainer, options);
		chart.render();
	}

	onMount(fetchData);
</script>

<!-- Contenedor de gráficos -->
<div bind:this={chartContainer}></div>
<br/>
<div bind:this={scatterContainer}></div>
