<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	interface Water {
		year: number;
		autonomous_community: string;
		project_count: number;
	}

	interface Traffic {
		year: number;
		autonomous_community: string;
		vehicles_without_mot: number;
	}

	let waterData: Water[] = [];
	let trafficData: Traffic[] = [];
	let communities: string[] = [];
	let errorMsg: string | null = null;
	let chart: Chart | null = null;
	let canvasEl: HTMLCanvasElement;

	function normalizeName(s: string): string {
		return s
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[̀-\u036f]/g, '')
			.replace(/ñ/g, 'n');
	}

	async function fetchAll() {
		try {
			const [wRes, tRes] = await Promise.all([
				fetch('/api/v1/water-supply-improvements'),
				fetch('https://sos2425-20.onrender.com/api/v1/traffic-accidents')
			]);
			if (!wRes.ok) throw new Error(`Water API: ${wRes.status}`);
			if (!tRes.ok) throw new Error(`Traffic API: ${tRes.status}`);

			const wJson: any[] = await wRes.json();
			const tJson: any[] = await tRes.json();

			waterData = wJson.map((w) => ({
				year: w.year,
				autonomous_community: normalizeName(w.autonomous_community),
				project_count: w.project_count
			}));
			trafficData = tJson.map((t) => ({
				year: t.year,
				autonomous_community: normalizeName(t.autonomous_community),
				vehicles_without_mot: t.vehicles_without_mot
			}));

			const set = new Set<string>();
			waterData.forEach((w) => set.add(w.autonomous_community));
			trafficData.forEach((t) => set.add(t.autonomous_community));
			communities = Array.from(set).sort();
		} catch (err: any) {
			errorMsg = err.message;
		}
	}

	function initChart() {
		const projectTotals = communities.map((c) =>
			waterData.reduce((sum, w) => (w.autonomous_community === c ? sum + w.project_count : sum), 0)
		);
		const vehicleTotals = communities.map((c) =>
			trafficData.reduce(
				(sum, t) => (t.autonomous_community === c ? sum + t.vehicles_without_mot : sum),
				0
			)
		);

		const bubbleData = communities.map((c, i) => ({
			x: projectTotals[i],
			y: vehicleTotals[i],
			r: Math.sqrt(projectTotals[i] + vehicleTotals[i]) + 4,
			label: c
		}));

		if (chart) {
			chart.destroy();
		}
		chart = new Chart(canvasEl, {
			type: 'bubble',
			data: {
				datasets: [
					{
						data: bubbleData,
						backgroundColor: '#a1537b'
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					title: { display: true, text: 'Proyectos de Agua vs Vehículos sin MOT' },
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: (context) => {
								const d = context.raw as any;
								return `${d.label}: ${d.x} proyectos, ${d.y} vehículos`;
							}
						}
					}
				},
				scales: {
					x: { title: { display: true, text: 'Proyectos de Agua' }, beginAtZero: true },
					y: { title: { display: true, text: 'Vehículos sin MOT' }, beginAtZero: true }
				}
			}
		});
	}

	onMount(async () => {
		await fetchAll();
		if (!errorMsg) initChart();
	});
</script>

<main class="p-4 mx-auto" style="max-width:800px;">
	<div style="text-align:center; margin-bottom:30px; margin-top:30px;">
		<a href="/integrations/water-supply-improvements/G10-accidents-stats"
			><button
				style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
				>G10-accidents-stats</button
			></a
		>
		<a href="/integrations/water-supply-improvements/G12-annual-retributions"
			><button
				style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
				>G12-annual-retributions</button
			></a
		>
		<a href="/integrations/water-supply-improvements/G14-employment-data"
			><button
				style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
				>G14-employment-data</button
			></a
		>
		<a href="/integrations/water-supply-improvements/G21-cultural-event"
			><button
				style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
				>G21-cultural-event</button
			></a
		>
	</div>
	<div class="chart-container">
		<canvas bind:this={canvasEl} class="chart"></canvas>
		<div class="chart-type">chartjs:bubble</div>
	</div>
	<button
		on:click={() => (window.location.href = '/graficos/water-supply-improvements')}
		style="display:block; margin:20px auto; padding:8px 12px; background-color:#8fc177; color:#000; border:none; border-radius:4px; font-size:14px; cursor:pointer;"
	>
		Volver
	</button>
</main>

<style>
	main {
		font-family: sans-serif;
		margin: 20px auto;
	}
	.chart-container {
		position: relative;
		background: #fff;
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	.chart {
		width: 100%;
		height: 400px;
	}
	.chart-type {
		position: absolute;
		bottom: 8px;
		right: 12px;
		background: rgba(255, 255, 255, 0.8);
		padding: 2px 6px;
		font-size: 12px;
		border-radius: 4px;
		color: #555;
	}
</style>
