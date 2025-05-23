<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	interface Fire {
		year: number;
		autonomous_community: string;
		number_of_accidents: number;
	}
	interface Water {
		year: number;
		autonomous_community: string;
		amount: number;
		benefited_population: number;
	}
	interface Park {
		declaration_date: number;
		autonomous_community: string;
		current_area: number;
	}

	function normalizeName(s: string) {
		return s
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/ñ/g, 'n');
	}

	let fires: Fire[] = [];
	let waters: Water[] = [];
	let parks: Park[] = [];
	let communities: string[] = [];

	let chart: Chart;
	let canvasEl: HTMLCanvasElement;

	async function fetchAll() {
		try {
			const [fRes, wRes, pRes] = await Promise.all([
				fetch('/api/v1/forest-fires'),
				fetch('/api/v1/water-supply-improvements'),
				fetch('/api/v2/national-parks')
			]);

			// Verificar las respuestas
			if (!fRes.ok) {
				console.error('Error al cargar incendios forestales:', await fRes.text());
				return;
			}
			if (!wRes.ok) {
				console.error('Error al cargar mejoras de suministro de agua:', await wRes.text());
				return;
			}
			if (!pRes.ok) {
				console.error('Error al cargar parques nacionales:', await pRes.text());
				return;
			}

			// Procesar respuestas JSON
			let fireData = await fRes.json();
			let waterData = await wRes.json();
			let parkData = await pRes.json();

			// Verificar que los datos sean arrays
			console.log('Datos de incendios:', fireData);
			console.log('Datos de agua:', waterData);
			console.log('Datos de parques:', parkData);

			// Comprobar si los datos están dentro de una propiedad (común en algunas APIs)
			if (fireData && !Array.isArray(fireData) && fireData.data) {
				fireData = fireData.data;
			}
			if (waterData && !Array.isArray(waterData) && waterData.data) {
				waterData = waterData.data;
			}
			if (parkData && !Array.isArray(parkData) && parkData.data) {
				parkData = parkData.data;
			}

			// Verificar de nuevo que son arrays antes de usar map
			if (!Array.isArray(fireData)) {
				console.error('Datos de incendios no es un array:', fireData);
				fireData = [];
			}
			if (!Array.isArray(waterData)) {
				console.error('Datos de agua no es un array:', waterData);
				waterData = [];
			}
			if (!Array.isArray(parkData)) {
				console.error('Datos de parques no es un array:', parkData);
				parkData = [];
			}

			// Ahora procesamos los datos con seguridad
			//@ts-ignore
			fires = fireData.map((f) => ({
				...f,
				autonomous_community: normalizeName(f.autonomous_community)
			}));
			//@ts-ignore
			waters = waterData.map((w) => ({
				...w,
				autonomous_community: normalizeName(w.autonomous_community)
			}));
			//@ts-ignore
			parks = parkData.map((p) => ({
				...p,
				autonomous_community: normalizeName(p.autonomous_community)
			}));

			// Resto del código original
			const commSet = new Set<string>();
			fires.forEach((f) => commSet.add(f.autonomous_community));
			waters.forEach((w) => commSet.add(w.autonomous_community));
			parks.forEach((p) => commSet.add(p.autonomous_community));
			communities = Array.from(commSet).sort();
		} catch (error) {
			console.error('Error al cargar datos:', error);
		}
	}

	function initChart() {
		chart = new Chart(canvasEl, {
			type: 'bar',
			data: {
				labels: communities,
				datasets: [
					{
						label: 'Incendios forestales',
						backgroundColor: '#f15c80',
						data: []
					},
					{
						label: 'Población beneficiada (agua)',
						backgroundColor: '#7cb5ec',
						data: []
					},
					{
						label: 'Área parques nacionales (ha)',
						backgroundColor: '#90ed7d',
						data: []
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Balance de Incendios, Cobertura de Parques y Agua por Comunidad',
						font: { size: 18 }
					},
					legend: {
						labels: { font: { size: 12 } }
					}
				},
				scales: {
					x: {
						title: { display: true, text: 'Comunidad Autónoma', font: { size: 14 } },
						ticks: { font: { size: 12 } }
					},
					y: {
						beginAtZero: true,
						title: { display: true, text: 'Valor acumulado', font: { size: 14 } },
						ticks: { font: { size: 12 } }
					}
				}
			}
		});
	}

	function updateChart() {
		const fireTotals = communities.map((c) =>
			fires.reduce(
				(sum, f) => (f.autonomous_community === c ? sum + f.number_of_accidents : sum),
				0
			)
		);
		const popTotals = communities.map((c) =>
			waters.reduce(
				(sum, w) => (w.autonomous_community === c ? sum + w.benefited_population : sum),
				0
			)
		);
		const parkTotals = communities.map((c) =>
			parks.reduce((sum, p) => (p.autonomous_community === c ? sum + p.current_area : sum), 0)
		);

		chart.data.datasets[0].data = fireTotals;
		chart.data.datasets[1].data = popTotals;
		chart.data.datasets[2].data = parkTotals;
		chart.update();
	}

	onMount(async () => {
		await fetchAll();
		initChart();
		updateChart();
	});
</script>

<main>
	<h2 style="text-align:center; font-weight:bold;">
		Balance de Incendios, Cobertura de Parques y Agua por Comunidad
	</h2>
	<canvas bind:this={canvasEl} style="display:block; margin:0 auto; width:75%; height:350px;"
	></canvas>

	
	<!-- Botones para las secciones de gráficos -->
	<div style="text-align:center; margin-top: 2rem;">
		<a href="/graficos/water-supply-improvements" style="text-decoration: none;">
			<button
				style="padding: 0.5rem 1rem; margin: 10px; background-color: #a8c686; border: none; border-radius: 8px; cursor: pointer;"
			>
				Gráficos Blanca
			</button>
		</a>

		<a href="/graficos/national-parks" style="text-decoration: none;">
			<button
				style="padding: 0.5rem 1rem; margin: 10px; background-color: #a8c686; border: none; border-radius: 8px; cursor: pointer;"
			>
				Gráficos Darío
			</button>
		</a>

		<a href="/graficos/forest-fires" style="text-decoration: none;">
			<button
				style="padding: 0.5rem 1rem; margin: 10px; background-color: #a8c686; border: none; border-radius: 8px; cursor: pointer;"
			>
				Gráficos Álvaro
			</button>
		</a>
	</div>
</main>

<style>
	main {
		font-family: sans-serif;
		margin: 20px auto;
		max-width: 900px;
	}

	button {
		background-color: #a8c686;
		color: #000;
		font-size: 16px;
		padding: 10px;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		width: auto;
		margin-left: 1rem;
	}

	button:hover {
		background-color: #9bb37c;
	}
</style>
