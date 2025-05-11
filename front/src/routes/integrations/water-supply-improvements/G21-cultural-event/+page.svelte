<script lang="ts">
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';

	interface Water {
		autonomous_community: string;
		project_count: number;
	}
	interface EventRec {
		province: string;
		total_event: number;
	}

	const provinceMap = {
		almeria: 'Andalucía',
		cadiz: 'Andalucía',
		cordoba: 'Andalucía',
		granada: 'Andalucía',
		huelva: 'Andalucía',
		jaen: 'Andalucía',
		malaga: 'Andalucía',
		sevilla: 'Andalucía',
		andalucia: 'Andalucía',
		huesca: 'Aragón',
		zaragoza: 'Aragón',
		teruel: 'Aragón',
		aragon: 'Aragón',
		oviedo: 'Asturias',
		aviles: 'Asturias',
		gijon: 'Asturias',
		asturias: 'Asturias',
		palma: 'Islas Baleares',
		baleares: 'Islas Baleares',
		'islas baleares': 'Islas Baleares',
		'las palmas': 'Canarias',
		'santa cruz de tenerife': 'Canarias',
		canarias: 'Canarias',
		santander: 'Cantabria',
		cantabria: 'Cantabria',
		toledo: 'Castilla-La Mancha',
		'ciudad real': 'Castilla-La-Mancha',
		cuenca: 'Castilla-La-Mancha',
		guadalajara: 'Castilla-La-Mancha',
		albacete: 'Castilla-La-Mancha',
		'castilla-la mancha': 'Castilla-La-Mancha',
		leon: 'Castilla y León',
		burgos: 'Castilla y León',
		zamora: 'Castilla y León',
		palencia: 'Castilla y León',
		salamanca: 'Castilla y León',
		avila: 'Castilla y León',
		segovia: 'Castilla y León',
		valladolid: 'Castilla y León',
		soria: 'Castilla y León',
		'castilla y leon': 'Castilla y León',
		barcelona: 'Cataluña',
		girona: 'Cataluña',
		lleida: 'Cataluña',
		tarragona: 'Cataluña',
		cataluna: 'Cataluña',
		valencia: 'Valencia',
		castellon: 'Valencia',
		alicante: 'Valencia',
		'comunidad valenciana': 'Valencia',
		badajoz: 'Extremadura',
		caceres: 'Extremadura',
		extremadura: 'Extremadura',
		'a coruna': 'Galicia',
		lugo: 'Galicia',
		ourense: 'Galicia',
		pontevedra: 'Galicia',
		galicia: 'Galicia',
		madrid: 'Comunidad de Madrid',
		'comunidad de madrid': 'Comunidad de Madrid',
		murcia: 'Región de Murcia',
		'región de murcia': 'Región de Murcia',
		pamplona: 'Navarra',
		navarra: 'Navarra',
		logrono: 'La Rioja',
		'la rioja': 'La Rioja',
		bilbao: 'País Vasco',
		donostia: 'País Vasco',
		'pais vasco': 'País Vasco',
		ceuta: 'Ceuta',
		'ciudad de ceuta': 'Ceuta',
		melilla: 'Melilla',
		'ciudad de melilla': 'Melilla'
	} as const;

	function normalize(s: string | undefined) {
		return (s || '')
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/ñ/g, 'n');
	}

	function mapToCommunity(prov: string): string {
		const key = normalize(prov) as keyof typeof provinceMap;
		return provinceMap[key] || 'Desconocido';
	}

	let waterData: Water[] = [];
	let eventData: EventRec[] = [];
	let chartDiv!: HTMLDivElement;
	let chartInstance!: echarts.ECharts;
	let errorMsg: string | null = null;

	async function fetchWater() {
		try {
			const res = await fetch('/api/v1/water-supply-improvements');
			const json: any[] = await res.json();
			waterData = json.map((w) => ({
				autonomous_community: mapToCommunity(w.autonomous_community),
				project_count: w.project_count
			}));
		} catch (e: any) {
			errorMsg = e.message;
		}
	}

	async function fetchEvents() {
		try {
			const res = await fetch('https://sos2425-21.onrender.com/api/v1/cultural-event');
			const json: any[] = await res.json();
			eventData = json.map((e) => ({
				province: e.province,
				total_event: e.total_event
			}));
		} catch (e: any) {
			errorMsg = e.message;
		}
	}

	function buildSunburstData() {
		const map = new Map<string, { projects: number; events: number }>();
		for (const w of waterData) {
			const cc = w.autonomous_community;
			if (!map.has(cc)) map.set(cc, { projects: 0, events: 0 });
			map.get(cc)!.projects += w.project_count;
		}
		for (const e of eventData) {
			const cc = mapToCommunity(e.province);
			if (!map.has(cc)) map.set(cc, { projects: 0, events: 0 });
			map.get(cc)!.events += e.total_event;
		}
		return Array.from(map.entries()).map(([cc, vals]) => ({
			name: cc,
			children: [
				{ name: 'Proyectos', value: vals.projects },
				{ name: 'Eventos', value: vals.events }
			]
		}));
	}

	onMount(async () => {
		await Promise.all([fetchWater(), fetchEvents()]);
		if (!errorMsg) {
			const data = buildSunburstData();
			chartInstance = echarts.init(chartDiv);
			chartInstance.setOption({
				title: { text: 'Sunburst: Proyectos y Eventos por CC.AA.', left: 'center' },
				tooltip: { trigger: 'item' },
				series: [
					{
						type: 'sunburst',
						data,
						radius: [0, '90%'],
						label: { rotate: 'radial' }
					}
				]
			});
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
		<a href="/integrations/water-supply-improvements/G14-employment-data"
			><button
				style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
				>G14-employment-data</button
			></a
		>
		<a href="/integrations/water-supply-improvements/G20-traffic-accidents"
			><button
				style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
				>G20-traffic-accidents</button
			></a
		>
	</div>

	<div class="chart-container">
		{#if errorMsg}
			<p class="text-red-600 text-center">{errorMsg}</p>
		{:else}
			<div bind:this={chartDiv} class="chart" style="height: 500px;"></div>
			<div class="chart-type">echarts:sunburst</div>
		{/if}
	</div>

	<button
		on:click={() => (window.location.href = '/graficos/water-supply-improvements')}
		class="back-btn"
	>
		Volver
	</button>
</main>

<style>
	.nav-btn {
		margin: 4px;
		padding: 8px 12px;
		background-color: #a8c686;
		color: #000;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	.chart-container {
		position: relative;
		background: #fff;
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 1rem;
	}
	.chart {
		width: 100%;
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
	.back-btn {
		display: block;
		margin: 20px auto;
		padding: 8px 12px;
		background-color: #8fc177;
		color: #000;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	main {
		font-family: sans-serif;
		margin: 20px auto;
	}
</style>
