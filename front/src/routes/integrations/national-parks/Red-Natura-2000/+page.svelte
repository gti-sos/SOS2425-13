<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import * as Highcharts from 'highcharts';
	// Importación para la animación de slide
	import { slide } from 'svelte/transition';

	/*
    Sobre esta integración:
    =======================
    
    VISUALIZACIÓN:
    -------------
    Gráfico scatter (dispersión): Muestra claramente la distribución de especies por parque.

    Visualización mejorada: 
       - El tamaño de los puntos es proporcional a la raíz cuadrada del número de especies
       - Los colores siguen el gradiente verde-amarillo-rojo (mayor número de especies)
       - Etiquetas legibles en cada punto para identificar los parques
       - Línea de tendencia: De tipo 'spline' (que no es 'line') que muestra la tendencia 
         general de biodiversidad entre los parques
       - Interactividad: Al hacer clic en un parque se muestra el listado detallado de especies
    
    APIS INTEGRADAS:
    ---------------
    1. API de Parques Nacionales (SOS2425-13)
       - Proporciona datos básicos de parques nacionales españoles
       - Se utiliza para obtener la lista de parques y sus características
    
    2. API de Red Natura 2000
       - Proporciona datos sobre especies presentes en cada espacio natural protegido
       - Endpoint principal: /obtenerespeciesporsitio?_idsitiorn2000={parkId}
       - Se realiza una llamada por cada parque nacional para obtener su listado completo de especies
       - Los nombres de esas especies son los nombres científicos (scientificName)
    
    3. API de GBIF (Global Biodiversity Information Facility)
       - Proporciona nombres comunes para los nombres científicos de las especies de la API anterior
       - Endpoint: /species/search?datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&q={scientificName}
       - Se implementa caché de resultados para evitar llamadas repetidas
       - Se busca preferentemente nombres en español (spa), luego en inglés (eng)
    
    4. API de EIDOS (IEPNB - Inventario Español del Patrimonio Natural y de la Biodiversidad)
       - Proporciona estados de conservación de las especies
       - Proceso en dos pasos:
         a) /rpc/obtenertaxonespornombre?_nombretaxon={scientificName} → Obtiene el nameId
         b) /rpc/obtenerestadosconservacionportaxonid?_idtaxon={nameId} → Obtiene estados de conservación
       - Se filtran estados relevantes para España, Canarias y Península
       - Se implementa codificación visual por colores según el nivel de amenaza
    
    PROCESAMIENTO DE DATOS:
    ----------------------
    - Carga asíncrona con procesamiento por lotes para no sobrecargar las APIs
    - Sistema de caché para optimizar llamadas repetidas (nombres comunes, estados de conservación)
    - Filtrado y transformación de datos para presentar la información más relevante
    - Procesamiento visual con etiquetas de colores según estado de conservación
*/

	// Variables para almacenar datos
	let spanishParks = [];
	let parkSpecies = {};
	let selectedPark = null;
	let loading = true; // Estado de carga general
	let loadingNames = false; // Nuevo estado para cargar solo los nombres comunes
	let error = null;
	let chartContainer;

	let isUicnInfoOpen = false; // Variable para controlar el acordeón UICN
    let isHabitatsInfoOpen = false; // Nueva variable para el acordeón de Directiva Hábitats
	// Objeto para almacenar los nombres comunes de las especies
	let speciesCommonNames = {};

	// Mapeo de IDs de parques a sus nombres
	const parkMappings = {
		ES0000141: 'Timanfaya',
		ES6140004: 'Sierra Nevada',
		ES4320077: 'Monfragüe',
		ES4160109: 'Sierra de Guadarrama',
		ES6170006: 'Sierra de las Nieves',
		ES0000024: 'Doñana',
		ES0000044: 'Garajonay',
		ES0000003: 'Picos de Europa',
		ES0000013: 'Tablas de Daimiel',
		ES0000043: 'Caldera de Taburiente',
		ES0000016: 'Ordesa y Monte Perdido',
		ES0000022: 'Aigüestortes'
	};

	// URLs para las APIs
	const PARKS_API = dev
		? 'http://localhost:16078/api/v2/national-parks'
		: 'https://sos2425-13.onrender.com/api/v2/national-parks';
	const RED_NATURA_API = dev
		? 'http://localhost:16078/api/v2/proxy/red-natura-2000'
		: 'https://sos2425-13.onrender.com/api/v2/proxy/red-natura-2000';

	// URL para la API de GBIF
	const GBIF_API = dev
		? 'http://localhost:16078/api/v2/proxy/gbif'
		: 'https://sos2425-13.onrender.com/api/v2/proxy/gbif';

	// URL para la API de EIDOS
	const EIDOS_API = dev
		? 'http://localhost:16078/api/v2/proxy/eidos'
		: 'https://sos2425-13.onrender.com/api/v2/proxy/eidos';

	// Objeto para almacenar los estados de conservación
	let speciesConservationStatus = {};

	// Función para obtener datos de parques españoles
	async function fetchSpanishParks() {
		try {
			const response = await fetch(PARKS_API);
			if (!response.ok) {
				throw new Error(`Error obteniendo parques españoles: ${response.status}`);
			}
			const data = await response.json();
			console.log('Datos de parques españoles:', data);
			spanishParks = data;
		} catch (err) {
			console.error('Error al cargar datos de parques españoles:', err);
			error = err.message;
		}
	}

	// Función para obtener especies de un parque específico
	async function fetchParkSpecies(parkId, parkName) {
		try {
			const response = await fetch(
				`${RED_NATURA_API}/obtenerespeciesporsitio?_idsitiorn2000=${parkId}`
			);
			if (!response.ok) {
				throw new Error(`Error obteniendo especies para ${parkName}: ${response.status}`);
			}
			const data = await response.json();
			console.log(`Datos de especies para ${parkName}:`, data);

			// Almacenamos los datos en el objeto parkSpecies usando el ID como clave
			parkSpecies[parkId] = data;

			return data;
		} catch (err) {
			console.error(`Error al cargar especies para ${parkName}:`, err);
			error = error || err.message;
			return [];
		}
	}

	// Función para obtener los datos de todos los parques registrados en Red Natura 2000
	async function fetchAllParksSpecies() {
		const parkIds = Object.keys(parkMappings);
		const fetchPromises = [];

		for (const parkId of parkIds) {
			const parkName = parkMappings[parkId];
			fetchPromises.push(fetchParkSpecies(parkId, parkName));
		}

		await Promise.all(fetchPromises);
		console.log('Datos de especies para todos los parques:', parkSpecies);
	}

	// Función para contar las especies por parque
	function countSpeciesByPark() {
		const speciesCounts = {};

		for (const [parkId, species] of Object.entries(parkSpecies)) {
			speciesCounts[parkId] = species.length;
		}

		return speciesCounts;
	}

	// Función para inicializar el gráfico usando Highcharts
	function initChart() {
		if (!chartContainer) return;

		const speciesCounts = countSpeciesByPark();
		const chartData = [];

		// Ordenar los parques por número de especies (mayor a menor)
		const sortedParks = Object.entries(speciesCounts)
			.sort((a, b) => b[1] - a[1])
			.map((entry) => entry[0]);

		// Encontrar el valor máximo para escalar proporcionalmente
		const maxSpecies = Math.max(...Object.values(speciesCounts));

		// Preparar datos para gráfico
		sortedParks.forEach((parkId, index) => {
			const count = speciesCounts[parkId];
			chartData.push({
				name: parkMappings[parkId],
				id: parkId,
				x: index,
				y: count,
				marker: {
					radius: Math.max(5, Math.sqrt(count) * 1.5), // Tamaño proporcional a la raíz cuadrada del número de especies
					fillColor: getColorForCount(count),
					lineWidth: 1,
					lineColor: '#FFFFFF'
				}
			});
		});

		// Crear gráfico de tipo scatter (dispersión)
		Highcharts.chart(chartContainer, {
			chart: {
				type: 'scatter',
				height: 500
			},
			title: {
				text: 'Biodiversidad en Parques Nacionales de España',
				align: 'center'
			},
			subtitle: {
				text: 'Datos de Red Natura 2000 - Número de especies por parque',
				align: 'center'
			},
			legend: {
				enabled: false
			},
			xAxis: {
				title: {
					text: 'Parques Nacionales'
				},
				categories: sortedParks.map((id) => parkMappings[id]),
				labels: {
					rotation: -45,
					style: {
						fontSize: '12px'
					}
				},
				tickWidth: 0,
				lineWidth: 0
			},
			yAxis: {
				title: {
					text: 'Número de especies'
				},
				gridLineWidth: 0.5,
				gridLineDashStyle: 'dash'
			},
			tooltip: {
				useHTML: true,
				formatter: function () {
					return `<b>${this.point.name}</b><br/>
                            Especies: ${this.point.y}<br/>
                            <span style="font-size: 0.8em">Haz clic para ver detalles</span>`;
				}
			},
			plotOptions: {
				scatter: {
					dataLabels: {
						enabled: true,
						format: '{point.name}',
						y: -20,
						style: {
							fontWeight: 'normal',
							textOutline: '1px white'
						}
					},
					animation: {
						duration: 1000
					},
					point: {
						events: {
							click: function () {
								handleParkClick(this.id);
							}
						}
					}
				}
			},
			// Añadir una línea de tendencia/promedio
			series: [
				{
					name: 'Parques Nacionales',
					data: chartData,
					zIndex: 2
				},
				{
					type: 'spline', // Esto es de tipo spline, no line (que está prohibido)
					name: 'Tendencia',
					data: chartData.map((point) => point.y),
					enableMouseTracking: false,
					marker: {
						enabled: false
					},
					color: 'rgba(120, 120, 120, 0.5)',
					dashStyle: 'shortdot',
					lineWidth: 2,
					zIndex: 1
				}
			]
		});
	}

	// Función para obtener un color basado en el número de especies
	function getColorForCount(count) {
		// Colores especiales para parques con pocas especies
		if (count < 50) {
			// Usar un color azul para parques con menos de 50 especies
			return `rgb(65, 105, 225)`; // Azul real (RoyalBlue)
		}

		// Para el resto, mantener el gradiente verde-amarillo-rojo
		const maxCount = 500;
		const ratio = Math.min(count / maxCount, 1);

		// Creamos un gradiente de color de verde a amarillo a rojo
		if (ratio < 0.5) {
			// Verde a amarillo (de 0% a 50%)
			const g = 255;
			const r = Math.floor(255 * (ratio * 2));
			return `rgb(${r}, ${g}, 0)`;
		} else {
			// Amarillo a rojo (de 50% a 100%)
			const r = 255;
			const g = Math.floor(255 * (1 - (ratio - 0.5) * 2));
			return `rgb(${r}, ${g}, 0)`;
		}
	}

	// Función para manejar el clic en un parque
	async function handleParkClick(parkId) {
		selectedPark = parkId;

		// Cargar nombres comunes y estados de conservación para las especies
		if (parkSpecies[parkId]) {
			loadingNames = true;

			try {
				// Procesar en lotes de 5 para no sobrecargar la API
				const speciesList = parkSpecies[parkId];
				const batchSize = 5;

				for (let i = 0; i < speciesList.length; i += batchSize) {
					const batch = speciesList.slice(i, i + batchSize);
					await Promise.all(
						batch.map(async (species) => {
							// Obtener nombre común
							const commonName = await fetchSpeciesCommonName(species.species_name);
							species.commonName = commonName;

							// Obtener estado de conservación
							const conservationStatus = await fetchSpeciesConservationStatus(species.species_name);
							species.conservationStatus = conservationStatus;
						})
					);
				}
			} catch (err) {
				console.error('Error al cargar datos adicionales de especies:', err);
			} finally {
				loadingNames = false;
			}
		}
	}

	// Función para obtener el nombre común de una especie desde GBIF
	async function fetchSpeciesCommonName(scientificName) {
		// Si ya tenemos el nombre común en caché, lo devolvemos
		if (speciesCommonNames[scientificName]) {
			return speciesCommonNames[scientificName];
		}

		try {
			const encodedName = encodeURIComponent(scientificName);
			const response = await fetch(
				`${GBIF_API}/species/search?datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&q=${encodedName}`
			);

			if (!response.ok) {
				throw new Error(`Error obteniendo nombre común para ${scientificName}: ${response.status}`);
			}

			const data = await response.json();

			// Buscar el resultado que coincida exactamente con el nombre científico
			const matchingSpecies = data.results.find(
				(result) => result.canonicalName?.toLowerCase() === scientificName.toLowerCase()
			);

			if (
				matchingSpecies &&
				matchingSpecies.vernacularNames &&
				matchingSpecies.vernacularNames.length > 0
			) {
				// Buscar primero un nombre en español
				const spanishName = matchingSpecies.vernacularNames.find((name) => name.language === 'spa');

				// Si hay nombre en español, lo usamos
				if (spanishName) {
					speciesCommonNames[scientificName] = spanishName.vernacularName;
					return spanishName.vernacularName;
				}

				// Si no hay nombre en español, buscamos en inglés
				const englishName = matchingSpecies.vernacularNames.find((name) => name.language === 'eng');

				if (englishName) {
					speciesCommonNames[scientificName] = englishName.vernacularName;
					return englishName.vernacularName;
				}

				// Si no hay en inglés, usamos el primero disponible
				speciesCommonNames[scientificName] = matchingSpecies.vernacularNames[0].vernacularName;
				return matchingSpecies.vernacularNames[0].vernacularName;
			}

			// Si no encontramos nombres comunes
			speciesCommonNames[scientificName] = 'No disponible';
			return 'No disponible';
		} catch (err) {
			console.error(`Error al obtener nombre común para ${scientificName}:`, err);
			speciesCommonNames[scientificName] = 'Error al obtener';
			return 'Error al obtener';
		}
	}

	// Función para obtener el estado de conservación de una especie desde EIDOS
	async function fetchSpeciesConservationStatus(scientificName) {
		// Si ya tenemos el estado de conservación en caché, lo devolvemos
		if (speciesConservationStatus[scientificName]) {
			return speciesConservationStatus[scientificName];
		}
		
		try {
			// Paso 1: Obtener el nameid
			const encodedName = encodeURIComponent(scientificName);
			const taxonResponse = await fetch(
				`${EIDOS_API}/rpc/obtenertaxonespornombre?_nombretaxon=${encodedName}`
			);
			
			if (!taxonResponse.ok) {
				throw new Error(`Error obteniendo taxón para ${scientificName}: ${taxonResponse.status}`);
			}
			
			const taxonData = await taxonResponse.json();
			
			// Si no hay resultados, devolver 'No disponible'
			if (!taxonData || taxonData.length === 0) {
				speciesConservationStatus[scientificName] = 'No disponible';
				return 'No disponible';
			}
			
			// Obtener el nameId del primer resultado
			const nameId = taxonData[0].nameid;
			
			// Paso 2: Obtener los estados de conservación
			const conservationResponse = await fetch(
				`${EIDOS_API}/rpc/obtenerestadosconservacionportaxonid?_idtaxon=${nameId}`
			);
			
			if (!conservationResponse.ok) {
				throw new Error(
					`Error obteniendo estado de conservación para ${scientificName}: ${conservationResponse.status}`
				);
			}
			
			const conservationData = await conservationResponse.json();
			
			// Si no hay resultados, devolver 'No disponible'
			if (!conservationData || conservationData.length === 0) {
				speciesConservationStatus[scientificName] = 'No disponible';
				return 'No disponible';
			}
			
			// Mostrar todos los valores únicos de 'aplicaa' para fines de depuración
			const uniqueRegions = [...new Set(conservationData.map(item => item.aplicaa))];
			console.log(`Regiones únicas para ${scientificName}:`, uniqueRegions);
			
			// Filtrar solo los que aplican a regiones relevantes y no son desconocidos
			let relevantStatuses = conservationData;
			if (conservationData.length > 1) {
				relevantStatuses = conservationData.slice(1);
			}
			
			// Ampliamos el filtro para incluir las nuevas regiones
			relevantStatuses = relevantStatuses.filter(
				(status) => 
					// Primero filtrar por región
					(status.aplicaa === 'España' ||
					status.aplicaa === 'Canarias' ||
					status.aplicaa === 'Península' ||
					status.aplicaa === 'Región Alpina' ||
					status.aplicaa === 'Región Mediterránea' ||
					status.aplicaa === 'Región Atlántica') &&
					// Luego excluir solo los estados realmente no relevantes 
					!status.categoriaconservacion.includes('NE (No evaluado)') &&
					!status.categoriaconservacion.includes('Bajo Riesgo-No Amenazada')
					// Ya no excluimos "XX (Desconocido)"
			);
			
			// Si no hay resultados después del filtrado, devolver 'No disponible'
			if (relevantStatuses.length === 0) {
				speciesConservationStatus[scientificName] = 'No disponible';
				return 'No disponible';
			}
			
			// NUEVO: Filtrar entradas duplicadas basadas en pares categoría-región
			const uniquePairs = new Set();
			const uniqueStatuses = [];
			
			for (const status of relevantStatuses) {
				// Crear una clave única para el par categoría-región
				const pairKey = `${status.categoriaconservacion}|${status.aplicaa}`;
				
				// Si este par no está en nuestro conjunto, lo añadimos
				if (!uniquePairs.has(pairKey)) {
					uniquePairs.add(pairKey);
					uniqueStatuses.push(status);
				}
			}
			
			// Extraer las categorías de conservación con sus regiones (usando los estados únicos)
			const categories = uniqueStatuses.map((status) => ({
				category: status.categoriaconservacion,
				region: status.aplicaa
			}));
			
			// Guardar en caché
			speciesConservationStatus[scientificName] = categories;
			return categories;
			
		} catch (err) {
			console.error(`Error al obtener estado de conservación para ${scientificName}:`, err);
			speciesConservationStatus[scientificName] = 'Error al obtener';
			return 'Error al obtener';
		}
	}

	// Función para obtener la clase CSS basada en la categoría de conservación
	function getConservationClass(category) {
		if (!category) return '';

		// Categorías UICN
		if (category.includes('CR') || category.includes('En peligro crítico')) return 'critical';
		if (category.includes('EN') || category.includes('En peligro')) return 'endangered';
		if (category.includes('VU') || category.includes('Vulnerable')) return 'vulnerable';
		if (category.includes('NT') || category.includes('Casi amenazado')) return 'near-threatened';
		if (category.includes('LC') || category.includes('Preocupación menor')) return 'least-concern';
		
		// Categorías de la Directiva Hábitats (U1, U2, etc.)
		if (category.includes('U1') || category.includes('Desfavorable inadecuado')) return 'unfavorable-inadequate';
		if (category.includes('U2') || category.includes('Desfavorable malo')) return 'unfavorable-bad';
		if (category.includes('FV') || category.includes('Favorable')) return 'favorable';
		
		return '';
	}

	// Inicializar al montar el componente
	onMount(async () => {
		loading = true;
		try {
			// Cargar datos de parques y especies
			await fetchSpanishParks();
			await fetchAllParksSpecies();

			loading = false;

			// Inicializar gráfico cuando los datos estén disponibles
			setTimeout(initChart, 100);
		} catch (err) {
			loading = false;
			error = err.message;
			console.error('Error general:', err);
		}
	});
</script>

<main>
	<h2>Integración con Red Natura 2000</h2>

	<div class="button-group">
		<a href="/graficos/national-parks">
			<button>Volver a Parques Nacionales</button>
		</a>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="loading">Cargando datos de especies y parques...</div>
		</div>
	{:else if error}
		<div class="error-container">
			<div class="error">Error: {error}</div>
		</div>
	{:else}
		<div class="explanation">
			<p>
				Esta visualización muestra el número de especies registradas en cada Parque Nacional español
				según los datos de la Red Natura 2000. El tamaño de cada burbuja representa el número de
				especies presentes en el parque.
			</p>
			<p>
				Haz clic en cualquier parque para ver el listado detallado de especies con sus nombres
				científicos, nombres comunes (GBIF) y estados de conservación (EIDOS).
			</p>
		</div>

		<div class="chart-container" bind:this={chartContainer}>
			<!-- El gráfico se renderizará aquí -->
		</div>

		{#if selectedPark}
			<div class="species-detail">
				<h3>Especies en {parkMappings[selectedPark]}</h3>
				<button class="close-button" on:click={() => (selectedPark = null)}>×</button>

				<div class="species-list">
					<p>Total de especies: <strong>{parkSpecies[selectedPark]?.length || 0}</strong></p>

					{#if loadingNames}
						<div class="loading-names">Cargando listado de especies. Espere, por favor...</div>
					{:else}
						<table>
							<thead>
								<tr>
									<th>Nombre Científico</th>
									<th>Nombre Común</th>
									<th>Estado de Conservación</th>
								</tr>
							</thead>
							<tbody>
								{#each parkSpecies[selectedPark] || [] as species}
									<tr>
										<td><i>{species.species_name}</i></td>
										<td>{species.commonName || 'Cargando...'}</td>
										<td>
											{#if species.conservationStatus && Array.isArray(species.conservationStatus)}
												<div class="conservation-status">
													{#each species.conservationStatus as status}
														<span
															class="conservation-tag {getConservationClass(status.category)}"
															title={status.region}
														>
															{status.category} ({status.region})
														</span>
													{/each}
												</div>
											{:else}
												{species.conservationStatus || 'No disponible'}
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Mover el acordeón AQUÍ, después de la lista de especies y antes de las fuentes -->
		<div class="uicn-accordion">
			<button class="accordion-button" on:click={() => (isUicnInfoOpen = !isUicnInfoOpen)}>
				{isUicnInfoOpen ? '▼' : '▶'} Categorías de Conservación según la UICN
			</button>

			{#if isUicnInfoOpen}
				<div class="accordion-content" transition:slide={{ duration: 300 }}>
					<div class="uicn-info">
						<p>
							La Unión Internacional para la Conservación de la Naturaleza (UICN) clasifica las
							especies según su riesgo de extinción. Estas categorías se utilizan en los datos de
							conservación mostrados:
						</p>
						<div class="uicn-image-container">
							<img src="/images/uicn-categories.jpg" alt="Categorías de conservación UICN" />
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Nuevo acordeón para Directiva Hábitats -->
		<div class="habitats-accordion">
			<button class="accordion-button habitats-button" on:click={() => (isHabitatsInfoOpen = !isHabitatsInfoOpen)}>
				{isHabitatsInfoOpen ? '▼' : '▶'} Categorías según Directiva Hábitats (Art. 17)
			</button>

			{#if isHabitatsInfoOpen}
				<div class="accordion-content" transition:slide={{ duration: 300 }}>
					<div class="habitats-info">
						<p>
							El Artículo 17 de la Directiva Hábitats establece un sistema de evaluación 
							del estado de conservación de los hábitats y especies para el periodo 2007-2012 
							en España. Estas categorías complementan la clasificación de la UICN:
						</p>
						<div class="habitats-image-container">
							<img src="/images/habitats-art17.jpg" alt="Categorías según Directiva Hábitats (Art. 17)" />
						</div>
					</div>
				</div>
			{/if}
		</div>

		<div class="sources">
			<h4>Fuentes de datos:</h4>
			<ul>
				<li>
					Parques Nacionales: <a
						href="https://sos2425-13.onrender.com/api/v2/national-parks"
						target="_blank">API del Grupo 13 (SOS2425-13)</a
					>
				</li>
				<li>
					Especies: <a
						href="https://iepnb.gob.es/recursos/servicios-interoperables/apirest-rednatura"
						target="_blank">API de Red Natura 2000</a
					>
                    , su
                    <a href="https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/servicios/banco-datos-naturaleza/informacion-disponible/cntryes/Natura2000_end2023_ES_20250423.zip" target="_blank"
                        >Base de Datos Oficial</a>
					y
					<a href="https://iepnb.gob.es/areas-tematicas/especies-silvestres/eidos" target="_blank"
						>página principal</a
					>
                    
				</li>
				<li>
					Nombres comunes: <a href="https://techdocs.gbif.org/en/openapi/" target="_blank"
						>API de GBIF (Global Biodiversity Information Facility)</a
					>
					y <a href="https://techdocs.gbif.org/en/" target="_blank">página principal</a>
				</li>
				<li>
					Estados de conservación: <a
						href="https://iepnb.gob.es/recursos/servicios-interoperables/apirest-eidos"
						target="_blank">API de Taxonomía EIDOS (IEPNB)</a
					>
					y
					<a href="https://iepnb.gob.es/areas-tematicas/especies-silvestres" target="_blank"
						>página principal</a
					>
				</li>
			</ul>
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 1000px;
		margin: 0 auto;
		padding: 20px;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		box-sizing: border-box;
		width: 100%;
		overflow-x: hidden;
	}

	h2 {
		color: #2c5e2e;
		text-align: center;
		margin-bottom: 1.2rem;
		font-size: 1.8rem;
	}

	.button-group {
		display: flex;
		justify-content: center;
		margin-bottom: 25px;
	}

	.button-group button {
		padding: 10px 18px;
		background-color: #3a9647;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s ease;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	.button-group button:hover {
		background-color: #2e7639;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.explanation {
		background-color: #f7fbf7;
		padding: 20px;
		border-radius: 10px;
		border-left: 5px solid #3a9647;
		margin-bottom: 30px;
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
	}

	.chart-container {
		height: 550px;
		margin: 30px 0;
		background-color: white;
		border-radius: 10px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		padding: 20px;
		overflow: hidden;
	}

	.loading-container,
	.error-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300px;
	}

	.loading {
		font-size: 18px;
		color: #3a9647;
	}

	.error {
		font-size: 18px;
		color: #e74c3c;
		text-align: center;
		padding: 20px;
	}

	.species-detail {
		position: relative;
		background-color: #f9f9f9;
		border-radius: 8px;
		padding: 20px;
		margin: 30px 0;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
	}

	.species-detail h3 {
		color: #2c5e2e;
		text-align: center;
		margin-bottom: 20px;
	}

	.close-button {
		position: absolute;
		top: 10px;
		right: 10px;
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		color: #666;
	}

	.close-button:hover {
		color: #e74c3c;
	}

	.species-list {
		max-height: 400px;
		overflow-y: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		background-color: #f0f0f0;
		padding: 10px;
		text-align: left;
		border-bottom: 2px solid #ddd;
		position: sticky;
		top: 0;
	}

	td {
		padding: 8px 10px;
		border-bottom: 1px solid #eee;
	}

	tr:hover {
		background-color: #f5f5f5;
	}

	.sources {
		background-color: #f5f5f5;
		padding: 20px;
		border-radius: 8px;
		margin: 30px 0;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.sources h4 {
		margin-top: 0;
		color: #2c5e2e;
		border-bottom: 2px solid #ddd;
		padding-bottom: 10px;
		margin-bottom: 15px;
	}

	.sources ul {
		list-style-type: none;
		padding-left: 0;
	}

	.sources li {
		margin-bottom: 10px;
		padding-left: 20px;
		position: relative;
	}

	.sources li:before {
		content: '•';
		color: #3a9647;
		font-weight: bold;
		position: absolute;
		left: 0;
	}

	.sources a {
		color: #0066cc;
		text-decoration: none;
	}

	.sources a:hover {
		text-decoration: underline;
	}

	/* Estilos para Highcharts */
	:global(.highcharts-container) {
		width: 100% !important;
		height: 100% !important;
	}

	:global(.highcharts-root) {
		width: 100% !important;
		height: 100% !important;
	}

	.conservation-status {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.conservation-tag {
		display: inline-block;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.85em;
		background-color: #f0f0f0;
		border: 1px solid #ddd;
	}

	/* Colores específicos para cada estado de conservación */
	.conservation-tag.critical {
		background-color: #d81e05;
		color: white;
		border-color: #a01604;
	}

	.conservation-tag.endangered {
		background-color: #fc7f3f;
		color: black;
		border-color: #e66a2b;
	}

	.conservation-tag.vulnerable {
		background-color: #f9e814;
		color: black;
		border-color: #d6c711;
	}

	.conservation-tag.near-threatened {
		background-color: #cce226;
		color: black;
		border-color: #b1c31d;
	}

	.conservation-tag.least-concern {
		background-color: #64c360;
		color: black;
		border-color: #4ea74a;
	}

	.conservation-tag.unfavorable-inadequate {
		background-color: #f39c12; /* Amarillo-naranja */
		color: black;
		border-color: #d68910;
	}

	.conservation-tag.unfavorable-bad {
		background-color: #e84118; /* Rojo oscuro */
		color: white;
		border-color: #c23616;
	}

	.conservation-tag.favorable {
		background-color: #27ae60; /* Verde oscuro */
		color: white;
		border-color: #219653;
	}

	.loading-names {
		text-align: center;
		padding: 20px;
		color: #3a9647;
		font-style: italic;
	}

	/* Estilos para el acordeón de UICN */
	.uicn-accordion {
		margin: 20px 0 30px 0;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.accordion-button {
		width: 100%;
		background-color: #3a9647;
		color: white;
		padding: 12px 20px;
		text-align: left;
		border: none;
		cursor: pointer;
		font-size: 16px;
		font-weight: 500;
		display: flex;
		align-items: center;
		transition: background-color 0.2s;
	}

	.accordion-button:hover {
		background-color: #2e7639;
	}

	.accordion-content {
		background-color: #f7fbf7;
		padding: 0;
		overflow: hidden;
	}

	.uicn-info {
		padding: 20px;
	}

	.uicn-info p {
		margin-top: 0;
		margin-bottom: 15px;
	}

	.uicn-image-container {
		text-align: center;
		margin: 15px 0;
	}

	.uicn-image-container img {
		max-width: 100%;
		border-radius: 6px;
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
	}

	/* Estilos para el acordeón de Hábitats */
	.habitats-accordion {
		margin: 0 0 30px 0; /* Solo margen inferior */
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.habitats-button {
		background-color: #336699; /* Color azul para diferenciar */
	}

	.habitats-button:hover {
		background-color: #264d73;
	}

	.habitats-info {
		padding: 20px;
	}

	.habitats-info p {
		margin-top: 0;
		margin-bottom: 15px;
	}

	.habitats-image-container {
		text-align: center;
		margin: 15px 0;
	}

	.habitats-image-container img {
		max-width: 100%;
		border-radius: 6px;
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
	}
</style>
