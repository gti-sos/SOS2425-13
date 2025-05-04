<script lang="ts">
	import { onMount } from 'svelte';
	import Highcharts from 'highcharts';
	import 'highcharts/highcharts-more'; // carga side‑effect el módulo bubble
	import Chart from 'chart.js/auto';
  
	interface DataItem {
	  autonomous_community: string;
	  amount: number;
	  year: number;
	  benefited_population: number;
	  project_count: number;
	}
  
	let data: DataItem[] = [];
	let years: number[] = [];
	let selectedYear: number;
  
	let chartContainer: HTMLCanvasElement;
	let pieChartInstance: Chart;
	let bubbleChartInstance: Highcharts.Chart;
  
	// Títulos dinámicos
	const bubbleTitle = 'Análisis Tridimensional: Fondos por Año y Población';
	$: pieTitle = `Distribución de fondos ${selectedYear}`;
  
	// Paleta de colores para comunidades
	const colorPalette = [
	  '#7cb5ec', '#434348', '#90ed7d', '#f7a35c',
	  '#8085e9', '#f15c80', '#e4d354', '#84e1d7',
	  '#8d4653', '#91e8e1'
	];
  
	async function fetchData() {
	  const resp = await fetch('/api/v1/water-supply-improvements');
	  if (!resp.ok) {
		console.error('Error al cargar datos:', await resp.text());
		return;
	  }
	  data = await resp.json();
	  years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
	  selectedYear = years[0];
	}
  
	async function initCharts() {
	  const communities = Array.from(new Set(data.map(d => d.autonomous_community)));
  
	  // --- Bubble chart con serie por comunidad para mostrar leyenda ---
	  const bubbleSeries = communities.map((comm, idx) => {
		const seriesData = data
		  .filter(d => d.autonomous_community === comm)
		  .map(d => ({ x: d.year, y: d.amount, z: d.benefited_population }));
		return {
		  type: 'bubble',
		  name: comm,
		  data: seriesData,
		  color: colorPalette[idx % colorPalette.length]
		};
	  });
  
	  bubbleChartInstance = Highcharts.chart('highcharts-bubble', {
		chart: { type: 'bubble' },
		title: { text: bubbleTitle },
		xAxis: {
		  title: { text: 'Año' },
		  tickPositions: years
		},
		yAxis: { title: { text: 'Fondos (€)' } },
		tooltip: {
		  headerFormat: '',
		  pointFormat:
			'<b>{series.name}</b><br>' +
			'Año: {point.x}<br>' +
			'Fondos: {point.y} €<br>' +
			'Población: {point.z}'
		},
		legend: {
		  enabled: true,
		  align: 'center',
		  verticalAlign: 'bottom'
		},
		series: bubbleSeries
	  });
  
	  // --- Pie chart inicial con colores y leyenda ---
	  const initial = data.filter(d => d.year === selectedYear);
	  const pieColors = initial.map(d => {
		const idx = communities.indexOf(d.autonomous_community);
		return colorPalette[idx % colorPalette.length];
	  });
	  pieChartInstance = new Chart(chartContainer, {
		type: 'pie',
		data: {
		  labels: initial.map(d => d.autonomous_community),
		  datasets: [{
			data: initial.map(d => d.amount),
			backgroundColor: pieColors
		  }]
		},
		options: {
		  plugins: {
			legend: { display: true, position: 'bottom' }
		  }
		}
	  });
	}
  
	// Actualiza solo el pie chart al cambiar año
	$: if (pieChartInstance && data.length) {
	  const filtered = data.filter(d => d.year === selectedYear);
	  const communities = Array.from(new Set(data.map(di => di.autonomous_community)));
	  const pieColors = filtered.map(d => {
		const idx = communities.indexOf(d.autonomous_community);
		return colorPalette[idx % colorPalette.length];
	  });
	  pieChartInstance.data.labels = filtered.map(d => d.autonomous_community);
	  pieChartInstance.data.datasets[0].data = filtered.map(d => d.amount);
	  pieChartInstance.data.datasets[0].backgroundColor = pieColors;
	  pieChartInstance.update();
	}
  
	onMount(async () => {
	  await fetchData();
	  await initCharts();
	});
  </script>
  
  <main>
	<h2>Visualizaciones de la Gestión de Recursos de Abastecimiento de Agua</h2>
  
	<!-- Botones de integración -->
	<div class="button-group">
	  <a href="/integraciones/watter-supply-improvements/G10-accidents-stats"><button>G10-accidents-stats</button></a>
	  <a href="/integraciones/watter-supply-improvements/G12-Annual-retributions"><button>G12-Annual-retributions</button></a>
	  <a href="/integraciones/watter-supply-improvements/G14-employment-data"><button>G14-employment-data</button></a>
	  <a href="/integraciones/watter-supply-improvements/G20-traffic-accidents"><button>G20-traffic-accidents</button></a>
	  <a href="/integraciones/watter-supply-improvements/G21-cultural-event"><button>G21-cultural-event</button></a>
	</div>
  
	{#if data.length}
	  <div class="chart-wrapper">
		<!-- Bubble chart -->
		<div class="chart-block">
		  <div class="chart-title">{bubbleTitle}</div>
		  <div id="highcharts-bubble" class="chart-box"></div>
		</div>
  
		<!-- Pie chart + filtro -->
		<div class="chart-block">
		  <div class="chart-title">{pieTitle}</div>
		  <div class="controls">
			<label>
			  Filtrar por año:
			  <select bind:value={selectedYear}>
				{#each years as y}
				  <option value={y}>{y}</option>
				{/each}
			  </select>
			</label>
		  </div>
		  <canvas bind:this={chartContainer} class="chart-box"></canvas>
		</div>
	  </div>
	{:else}
	  <p>Cargando datos…</p>
	{/if}
  </main>
  
  <style>
	/* Título principal centrado con margen */
	main h2 {
	  text-align: center;
	  margin: 2rem 0;
	}
  
	/* Botones */
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
	}
	.button-group button:hover {
	  background-color: #9bb37c;
	}
  
	/* Grid */
	.chart-wrapper {
	  display: grid;
	  grid-template-columns: 1fr 1fr;
	  gap: 4rem;
	  max-width: 1000px;
	  margin: 0 auto;
	}
  
	/* Bloques de gráfico */
	.chart-block {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	}
  
	.chart-title {
	  font-weight: bold;
	  text-align: center;
	  margin-bottom: 1rem;
	}
  
	.controls {
	  margin-bottom: 1rem;
	  text-align: center;
	}
  
	select {
	  font-size: 1rem;
	  padding: 0.3rem;
	}
  
	.chart-box {
	  width: 100%;
	  height: 400px;
	}
  </style>
  