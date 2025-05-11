<script lang="ts">
	import { onMount } from 'svelte';
	import ApexCharts from 'apexcharts';

	interface Water {
		autonomous_community: string;
		project_count: number;
	}

	interface Employment {
		autonomous_community: string;
		employment_rate: number;
	}

	let waterData: Water[] = [];
	let employmentData: Employment[] = [];
	let errorMsg: string | null = null;
	let chartDiv: HTMLDivElement;
	let chart: ApexCharts | null = null;

	function normalize(s: string): string {
		const norm = s
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.replace(/-/g, ' ')
			.replace(/ñ/g, 'n');
		const map: Record<string, string> = {
			andalucia: 'Andalucía',
			aragon: 'Aragón',
			asturias: 'Asturias',
			baleares: 'Islas Baleares',
			canarias: 'Canarias',
			cantabria: 'Cantabria',
			'castilla la mancha': 'Castilla-La-Mancha',
			'castilla y leon': 'Castilla y León',
			cataluna: 'Cataluña',
			valencia: 'Comunidad Valenciana',
			extremadura: 'Extremadura',
			galicia: 'Galicia',
			madrid: 'Comunidad de Madrid',
			murcia: 'Región de Murcia',
			navarra: 'Navarra',
			'la rioja': 'La Rioja',
			'pais vasco': 'País Vasco',
			ceuta: 'Ceuta',
			melilla: 'Melilla'
		};
		for (const key in map) if (norm.includes(key)) return map[key];
		return s;
	}

	async function fetchWater() {
		const res = await fetch('/api/v1/water-supply-improvements');
		if (!res.ok) throw new Error(`Water API: ${res.status}`);
		const json: any[] = await res.json();
		waterData = json.map((w) => ({
			autonomous_community: normalize(w.autonomous_community || w.region),
			project_count: w.project_count
		}));
	}

	async function fetchEmployment() {
		const res = await fetch('https://sos2425-14.onrender.com/api/v1/employment-data');
		if (!res.ok) throw new Error(`Employment API: ${res.status}`);
		const json: any[] = await res.json();
		employmentData = json.map((e) => ({
			autonomous_community: normalize(e.autonomous_community),
			employment_rate: e.employment_rate
		}));
	}

	function initChart() {
		const communities = Array.from(
			new Set([
				...waterData.map((w) => w.autonomous_community),
				...employmentData.map((e) => e.autonomous_community)
			])
		).sort((a, b) => a.localeCompare(b, 'es'));

		const projects = communities.map(
			(c) => waterData.find((w) => w.autonomous_community === c)?.project_count || 0
		);
		const rates = communities.map(
			(c) => employmentData.find((e) => e.autonomous_community === c)?.employment_rate || 0
		);

		const options: ApexCharts.ApexOptions = {
			chart: { type: 'radar', height: 600, width: '100%', toolbar: { show: false } },
			title: { text: 'Proyectos de Agua vs Employment Rate', align: 'center' },
			xaxis: { categories: communities },
			yaxis: { tickAmount: 5 },
			series: [
				{ name: 'Proyectos de Agua', data: projects },
				{ name: 'Employment Rate (%)', data: rates }
			],
			stroke: { width: 3 },
			fill: { opacity: 0.5 },
			markers: { size: 6 },
			legend: { position: 'bottom', fontSize: '14px' }
		};

		if (chart) {
			chart.updateOptions(options);
		} else {
			chart = new ApexCharts(chartDiv, options);
			chart.render();
		}
	}

	onMount(async () => {
		try {
			await Promise.all([fetchWater(), fetchEmployment()]);
			initChart();
		} catch (err: any) {
			errorMsg = err.message;
			console.error(err);
		}
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
		<a href="/integrations/water-supply-improvements/G20-traffic-accidents"
			><button
				style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
				>G20-traffic-accidents</button
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
		<h2 class="text-center text-2xl mb-4">Proyectos de Agua vs Employment Rate</h2>
		{#if errorMsg}
			<p class="text-red-600 text-center">{errorMsg}</p>
		{:else}
			<div bind:this={chartDiv} class="chart" style="width:100%; height:500px;"></div>
			<div class="chart-type">apexcharts:radar</div>
		{/if}
	</div>
	<button
		on:click={() => (window.location.href = '/graficos/water-supply-improvements')}
		style="display:block; margin:20px auto; padding:8px 12px; background-color:#8fc177; color:#000; border:none; border-radius:4px; cursor:pointer;"
		>Volver</button
	>
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
