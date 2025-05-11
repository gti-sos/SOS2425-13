<script lang="ts">
	import { onMount } from 'svelte';
	import * as echarts from 'echarts';

	interface Water {
		autonomous_community: string;
		project_count: number;
		benefited_population: number;
	}
	interface Traffic {
		accident_id: number;
		province: string;
		autonomous_community: string;
		accident_type: number;
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
		huesca: 'Aragón',
		zaragoza: 'Aragón',
		teruel: 'Aragón',
		oviedo: 'Asturias',
		aviles: 'Asturias',
		gijon: 'Asturias',
		palma: 'Islas Baleares',
		'las palmas': 'Canarias',
		'santa cruz de tenerife': 'Canarias',
		santander: 'Cantabria',
		toledo: 'Castilla-La-Mancha',
		'ciudad real': 'Castilla-La-Mancha',
		cuenca: 'Castilla-La-Mancha',
		guadalajara: 'Castilla-La-Mancha',
		albacete: 'Castilla-La-Mancha',
		leon: 'Castilla y León',
		burgos: 'Castilla y León',
		zamora: 'Castilla y León',
		palencia: 'Castilla y León',
		salamanca: 'Castilla y León',
		avila: 'Castilla y León',
		segovia: 'Castilla y León',
		valladolid: 'Castilla y León',
		soria: 'Castilla y León',
		barcelona: 'Cataluña',
		girona: 'Cataluña',
		lleida: 'Cataluña',
		tarragona: 'Cataluña',
		valencia: 'Comunidad Valenciana',
		castellon: 'Comunidad Valenciana',
		alicante: 'Comunidad Valenciana',
		badajoz: 'Extremadura',
		caceres: 'Extremadura',
		'a coruna': 'Galicia',
		lugo: 'Galicia',
		ourense: 'Galicia',
		pontevedra: 'Galicia',
		madrid: 'Comunidad de Madrid',
		murcia: 'Región de Murcia',
		pamplona: 'Navarra',
		logrono: 'La Rioja',
		bilbao: 'País Vasco',
		donostia: 'País Vasco',
		ceuta: 'Ceuta',
		melilla: 'Melilla'
	} as const;

	function normalize(s: string | undefined) {
		return (s ?? '')
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/ñ/g, 'n');
	}

	const allCommunities = Object.values(provinceMap) as string[];
	const uniqueCommunities = Array.from(new Set(allCommunities));
	const communityDisplayMap: Record<string, string> = {};
	uniqueCommunities.forEach((raw) => {
		communityDisplayMap[normalize(raw)] = raw;
	});

	let waterData: Water[] = [];
	let trafficData: Traffic[] = [];
	let chartDiv!: HTMLDivElement;
	let chartInstance!: echarts.ECharts;

	function mapToCommunity(prov: string): string {
		const key = normalize(prov) as keyof typeof provinceMap;
		return provinceMap[key] || 'Desconocido';
	}

	async function fetchWater() {
		const res = await fetch('/api/v1/water-supply-improvements');
		const json: any[] = await res.json();
		waterData = json.map((w) => {
			const norm = normalize(w.autonomous_community);
			return {
				autonomous_community: communityDisplayMap[norm] ?? w.autonomous_community,
				project_count: w.project_count,
				benefited_population: w.benefited_population ?? 0
			};
		});
	}

	async function fetchTraffic() {
		const res = await fetch('https://sos2425-10.onrender.com/api/v1/accidents-stats');
		const json: any[] = await res.json();
		trafficData = json.map((t) => ({
			accident_id: t.accident_id,
			province: t.province,
			autonomous_community: mapToCommunity(t.province),
			accident_type: t.accident_type
		}));
	}

	function initChart() {
		const comms = Array.from(
			new Set([
				...waterData.map((w) => w.autonomous_community),
				...trafficData.map((t) => t.autonomous_community)
			])
		).sort();

		const populationTotals = comms.map((c) =>
			waterData.reduce(
				(sum, w) => (w.autonomous_community === c ? sum + w.benefited_population : sum),
				0
			)
		);

		const waterSeries: echarts.ScatterSeriesOption = {
			name: 'Población Beneficiada',
			type: 'scatter',
			symbolSize: 10,
			data: comms.map((c, i) => [c, populationTotals[i]]),
			itemStyle: { color: '#42a5f5' }
		};

		const accidentSeries: echarts.ScatterSeriesOption = {
			name: 'Accident IDs',
			type: 'scatter',
			symbolSize: 10,
			data: trafficData.map((t) => [t.autonomous_community, t.accident_id]),
			itemStyle: { color: '#ff6384' }
		};

		const option: echarts.EChartsOption = {
			title: { text: 'Población Beneficiada vs Accident IDs', left: 'center' },
			tooltip: { trigger: 'item' },
			legend: { top: 30, data: ['Población Beneficiada', 'Accident IDs'] },
			xAxis: { type: 'category', data: comms, name: 'Comunidad Autónoma' },
			yAxis: { type: 'value', name: 'Población / ID', min: 0 },
			series: [waterSeries, accidentSeries]
		};

		chartInstance = echarts.init(chartDiv);
		chartInstance.setOption(option);
	}

	onMount(async () => {
		await Promise.all([fetchWater(), fetchTraffic()]);
		initChart();
	});
</script>

<main class="p-4 mx-auto" style="max-width:900px;">
	<div style="text-align:center; margin-bottom:30px; margin-top:30px;">
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
		<a href="/integrations/water-supply-improvements/G21-cultural-event"
			><button
				style="margin:4px; padding:8px 12px; background-color:#a8c686; color:#000; border:none; border-radius:4px; cursor:pointer;"
				>G21-cultural-event</button
			></a
		>
	</div>
	<div class="chart-container">
		<div bind:this={chartDiv} class="chart" style="width:80%; height:400px; margin:0 auto;"></div>
		<div class="chart-type">echarts:scatter</div>
	</div>
	<button
		on:click={() => (window.location.href = '/graficos/water-supply-improvements')}
		style="display:block; margin:20px auto; padding:8px 12px; background-color:#8fc177; color:#000; border:none; border-radius:4px; cursor:pointer;"
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
