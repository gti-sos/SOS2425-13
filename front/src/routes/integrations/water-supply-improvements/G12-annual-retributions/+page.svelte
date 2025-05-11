<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
  
	interface Retribution {
	  technology: string;
	  subsidized_energy: number;
	}
  
	interface Water {
	  aacc: string;
	  benefited_population: number;
	}
  
	let retributionData: Retribution[] = [];
	let waterData: Water[] = [];
	let combinedChart: Chart | null = null;
	let combinedCanvasEl: HTMLCanvasElement;
  
	async function fetchRetributions() {
	  const res = await fetch('https://sos2425-12.onrender.com/api/v2/annual-retributions');
	  const json: any[] = await res.json();
	  retributionData = json.map(r => ({ technology: r.technology, subsidized_energy: r.subsidized_energy }));
	}
  
	async function fetchWater() {
	  const res = await fetch('/api/v1/water-supply-improvements');
	  const json: any[] = await res.json();
	  const popMap: Record<string, number> = {};
	  json.forEach(w => {
		const key = w.autonomous_community || w.aacc || w.region;
		popMap[key] = (popMap[key] || 0) + (w.benefited_population || 0);
	  });
	  waterData = Object.entries(popMap).map(([aacc, benefited_population]) => ({ aacc, benefited_population }));
	}
  
	function initCombinedChart() {
	  const techMap: Record<string, number> = {};
	  retributionData.forEach(r => techMap[r.technology] = (techMap[r.technology] || 0) + r.subsidized_energy);
	  const techLabels = Object.keys(techMap);
	  const techValues = techLabels.map(t => techMap[t]);
  
	  const popLabels = waterData.map(w => w.aacc);
	  const popValues = waterData.map(w => w.benefited_population);
  
	  const labels = [...techLabels, ...popLabels];
	  const dataEnergy = [...techValues, ...Array(popLabels.length).fill(0)];
	  const dataPopulation = [...Array(techLabels.length).fill(0), ...popValues];
  
	  if (combinedChart) combinedChart.destroy();
	  combinedChart = new Chart(combinedCanvasEl, {
		type: 'doughnut',
		data: {
		  labels,
		  datasets: [
			{ label: 'Energía Subsidada', data: dataEnergy, weight: 1, spacing: 2 },
			{ label: 'Población Beneficiada', data: dataPopulation, weight: 2, spacing: 2 }
		  ]
		},
		options: { responsive: true, plugins: { title: { display: false }, legend: { position: 'bottom' } } }
	  });
	}
  
	onMount(async () => {
	  await Promise.all([fetchRetributions(), fetchWater()]);
	  initCombinedChart();
	});
  </script>
  
  <main class="p-4 mx-auto" style="max-width:800px;">
	<div style="text-align:center; margin-bottom:30px; margin-top:30px;">
	  <a href="/integrations/water-supply-improvements/G10-accidents-stats"><button
		  style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
		>G10-accidents-stats</button></a>
	  <a href="/integrations/water-supply-improvements/G14-employment-data"><button
		  style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
		>G14-employment-data</button></a>
	  <a href="/integrations/water-supply-improvements/G20-traffic-accidents"><button
		  style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
		>G20-traffic-accidents</button></a>
	  <a href="/integrations/water-supply-improvements/G21-cultural-event"><button
		  style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
		>G21-cultural-event</button></a>
	</div>
  
	<div class="chart-container">
	  <h2 class="text-center text-2xl mb-4">Energía y Población en Anillos</h2>
	  <div style="text-align:center; margin-bottom:20px; font-size:14px;">
		<strong>Anillo interior:</strong> Energía Subsidada<br />
		<strong>Anillo exterior:</strong> Población Beneficiada
	  </div>
	  <canvas bind:this={combinedCanvasEl} class="chart" style="max-width:75%; margin:0 auto; height:400px;"></canvas>
	  <div class="chart-type">chartjs:doughnut</div>
	</div>
  
	<button on:click={() => window.location.href = '/graficos/water-supply-improvements'}
	  style="display:block; margin:20px auto; padding:8px 12px; background-color:#8fc177; color:#000; border:none; border-radius:4px; cursor:pointer;"
	>Volver</button>
  </main>
  
  <style>
	main { font-family: sans-serif; margin: 20px auto; }
	.chart-container {
	  position: relative;
	  background: #fff;
	  padding: 1rem;
	  border-radius: 8px;
	  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}
	.chart {
	  width: 100%;
	}
	.chart-type {
	  position: absolute;
	  bottom: 8px;
	  right: 12px;
	  background: rgba(255,255,255,0.8);
	  padding: 2px 6px;
	  font-size: 12px;
	  border-radius: 4px;
	  color: #555;
	}
  </style>
  