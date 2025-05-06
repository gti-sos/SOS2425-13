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
	let combinedChart: Chart;
	let combinedCanvasEl: HTMLCanvasElement;

	async function fetchRetributions() {
		const res = await fetch('https://sos2425-12.onrender.com/api/v2/annual-retributions');
		const json: any[] = await res.json();
		retributionData = json.map((r) => ({
			technology: r.technology,
			subsidized_energy: r.subsidized_energy
		}));
	}

	async function fetchWater() {
		const res = await fetch('/api/v1/water-supply-improvements');
		const json: any[] = await res.json();
		const popMap: Record<string, number> = {};
		json.forEach((w: any) => {
			const key = w.autonomous_community || w.aacc || w.region;
			popMap[key] = (popMap[key] || 0) + (w.benefited_population || 0);
		});
		waterData = Object.entries(popMap).map(([aacc, benefited_population]) => ({
			aacc,
			benefited_population
		}));
	}

	function initCombinedChart() {
		// Prepare energy data
		const techMap: Record<string, number> = {};
		retributionData.forEach(
			(r) => (techMap[r.technology] = (techMap[r.technology] || 0) + r.subsidized_energy)
		);
		const techLabels = Object.keys(techMap);
		const techValues = techLabels.map((t) => techMap[t]);

		// Prepare population data
		const popLabels = waterData.map((w) => w.aacc);
		const popValues = waterData.map((w) => w.benefited_population);

		combinedChart = new Chart(combinedCanvasEl, {
			type: 'doughnut',
			data: {
				labels: [...techLabels, ...popLabels],
				datasets: [
					{
						label: 'Energía Subsidada',
						data: [...techValues, ...Array(popLabels.length).fill(0)],
						backgroundColor: [
							'#4dc9f6',
							'#f67019',
							'#f53794',
							'#537bc4',
							'#acc236',
							'#166a8f',
							'#00a950',
							'#58595b',
							'#8549ba'
						],
						weight: 1,
						spacing: 2
					},
					{
						label: 'Población Beneficiada',
						data: [...Array(techLabels.length).fill(0), ...popValues],
						backgroundColor: [
							'#ff6384',
							'#36a2eb',
							'#cc65fe',
							'#ffce56',
							'#2ecc71',
							'#e74c3c',
							'#3498db',
							'#9b59b6',
							'#f1c40f'
						],
						weight: 2,
						spacing: 2
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true
					},
					legend: {
						position: 'bottom',
						labels: {
							boxWidth: 12,
							padding: 20
						}
					}
				}
			}
		});
	}

	onMount(async () => {
		await Promise.all([fetchRetributions(), fetchWater()]);
		initCombinedChart();
	});
</script>

<main>
	<div style="text-align:center; margin-bottom:30px; margin-top:30px;">
		<a href="/integraciones/watter-supply-improvements/G10-accidents-stats"
			><button
				style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
				>G10-accidents-stats</button
			></a
		>
		<a href="/integraciones/watter-supply-improvements/G14-employment-data"
			><button
				style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
				>G14-employment-data</button
			></a
		>
		<a href="/integraciones/watter-supply-improvements/G20-traffic-accidents"
			><button
				style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
				>G20-traffic-accidents</button
			></a
		>
		<a href="/integraciones/watter-supply-improvements/G21-cultural-event"
			><button
				style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
				>G21-cultural-event</button
			></a
		>
	</div>
	<h2 style="text-align:center; margin-bottom:20px;">Energía y Población en anillos separados</h2>
	<div style="text-align:center; margin-bottom:20px; font-size:14px;">
		<strong>Anillo exterior:</strong> Población Beneficiada<br />
		<strong>Anillo interior:</strong> Energía Subsidada
	</div>
	<canvas
		bind:this={combinedCanvasEl}
		style="max-width:75%; margin:0 auto; display:block; height:400px;"
	></canvas>
	<button on:click={() => window.location.href = '/graficos/watter-supply-improvements'} style="display:block; margin:20px auto; padding:8px 12px; background-color:#8fc177; color:#000; border:none; border-radius:4px; font-size:14px; cursor:pointer;">
		Volver
	  </button>
</main>

<style>
	main {
		font-family: sans-serif;
		margin: 20px auto;
		max-width: 800px;
	}
</style>
