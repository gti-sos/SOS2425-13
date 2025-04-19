<script>
	//@ts-nocheck
	//@ts-ignore
	import { onMount } from 'svelte';
	import { Button, Table, Alert } from '@sveltestrap/sveltestrap';
	import { dev } from '$app/environment'; // Importing the dev variable to check the environment
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let DEVEL_HOST = 'http://localhost:16078';
	let PRODUCTION_HOST = 'https://sos2425-13.onrender.com';

	let API = '/api/v1/national-parks';
	if (dev) {
		API = DEVEL_HOST + API; // Use development host if in development mode
	} else {
		API = PRODUCTION_HOST + API; // Use production host if in production mode
	}

	let national_parks = [];
	let result = '';
	let resultStatus = '';
	let newNationalParkName;
	let newDeclarationDate;
	let newAutonomousCommunity;
	let newInitialArea;
	let newCurrentArea;
	let showCreateForm = false;
	let tipoMensaje = '';
	let mensaje = '';

	/* -------------- ORDENACIÓN DE COLUMNAS -------------- */
	let sortField = 'national_park'; // Campo por defecto para ordenar
	let sortDirection = 'asc'; // Dirección de ordenación: 'asc' o 'desc'
	let isCustomSorted = false; // Variable para controlar si se ha aplicado un ordenamiento personalizado

	// Función para cambiar el criterio de ordenación
	function sortBy(field) {
		isCustomSorted = true; // Activa la ordenación personalizada

		// Si hacemos clic en el mismo campo, invertimos la dirección
		if (field === sortField) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// Si es un campo diferente, establecemos el nuevo campo y dirección ascendente
			sortField = field;
			sortDirection = 'asc';
		}
	}

	// Función para obtener parques ordenados
	$: sortedParks = isCustomSorted
		? [...national_parks].sort((a, b) => {
				// Determina si los valores son numéricos
				const isNumeric = ['declaration_date', 'initial_area', 'current_area'].includes(sortField);

				// Compara según el tipo de dato
				let valueA = a[sortField];
				let valueB = b[sortField];

				// Conversión numérica si es necesario
				if (isNumeric) {
					valueA = Number(valueA);
					valueB = Number(valueB);
				}

				// Ordenamiento
				if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
				if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
				return 0;
			})
		: national_parks; // Si no hay ordenación personalizada, simplemente usa national_parks
	/* ----------------------------------------------------------- */

	/*-------------- BÚSQUEDA POR PARÁMETROS --------------*/
	let showSearchForm = false;
	let searchParams = {
		national_park: '',
		autonomous_community: '',
		from: '',
		to: '',
		initial_area_min: '',
		initial_area_max: '',
		current_area_min: '',
		current_area_max: ''
	};

	// Función para mostrar/ocultar el formulario de búsqueda
	function toggleSearchForm() {
		showSearchForm = !showSearchForm;
	}

	// Función para realizar la búsqueda
	async function searchNationalParks() {
		mensaje = '';

		// Construir la URL con los parámetros de búsqueda
		let url = new URL(API, window.location.origin);

		// Añadir parámetros no vacíos
		if (searchParams.national_park)
			url.searchParams.append('national_park', searchParams.national_park);
		if (searchParams.autonomous_community)
			url.searchParams.append('autonomous_community', searchParams.autonomous_community);
		if (searchParams.from) url.searchParams.append('from', searchParams.from);
		if (searchParams.to) url.searchParams.append('to', searchParams.to);

		// Para áreas, usar lógica adicional en el backend
		if (searchParams.initial_area_min)
			url.searchParams.append('initial_area_min', searchParams.initial_area_min);
		if (searchParams.initial_area_max)
			url.searchParams.append('initial_area_max', searchParams.initial_area_max);
		if (searchParams.current_area_min)
			url.searchParams.append('current_area_min', searchParams.current_area_min);
		if (searchParams.current_area_max)
			url.searchParams.append('current_area_max', searchParams.current_area_max);

		try {
			const res = await fetch(url, { method: 'GET' });
			const data = await res.json();

			if (res.ok) {
				national_parks = data;
				if (data.length === 0) {
					mostrarMensaje(
						'No se encontraron parques que coincidan con los criterios de búsqueda.',
						'warning'
					);
				} else {
					mostrarMensaje(`Se encontraron ${data.length} parques.`, 'success');
				}
			} else {
				mostrarMensaje('Error al realizar la búsqueda.', 'error');
			}
		} catch (error) {
			console.error('Error al realizar la búsqueda:', error);
			mostrarMensaje('Error de conexión al realizar la búsqueda.', 'error');
		}
	}

	// Función para limpiar el formulario de búsqueda
	function clearSearchForm() {
		searchParams = {
			national_park: '',
			autonomous_community: '',
			from: '',
			to: '',
			initial_area_min: '',
			initial_area_max: '',
			current_area_min: '',
			current_area_max: ''
		};
		getNationalParks(); // Recargar todos los parques
	}
	/* ----------------------------------------------------------- */

    /* -------------- BÚSQUEDA RÁPIDA (por comunidad autónoma y año de declaración) -------------- */
    async function searchByCommunityAndYear() {
    mensaje = '';
    
    // Verificar que tenemos comunidad y un año específico (from = to)
    if (!searchParams.autonomous_community) {
        mostrarMensaje("Debe especificar una comunidad autónoma", "warning");
        return;
    }
    
    if (!searchParams.from || !searchParams.to || searchParams.from !== searchParams.to) {
        mostrarMensaje("Para búsqueda específica, 'Año desde' y 'Año hasta' deben coincidir", "warning");
        return;
    }
    
    try {
        // Usar la ruta especial del backend
        const specificURL = `${API}/${encodeURIComponent(searchParams.autonomous_community)}/${searchParams.from}`;
        const res = await fetch(specificURL, { method: 'GET' });
        
        if (res.ok) {
            const data = await res.json();
            
            // Si devuelve un objeto en lugar de array, convertirlo a array
            national_parks = Array.isArray(data) ? data : [data];
            
            if (national_parks.length === 0) {
                mostrarMensaje(`No se encontraron parques en ${searchParams.autonomous_community} declarados en ${searchParams.from}.`, 'warning');
            } else {
                mostrarMensaje(`Se encontraron ${national_parks.length} parques en ${searchParams.autonomous_community} declarados en ${searchParams.from}.`, 'success');
            }
        } else {
            const errorData = await res.json();
            mostrarMensaje(`Error: ${errorData.message || 'Error al realizar la búsqueda específica.'}`, 'error');
        }
    } catch (error) {
        console.error('Error en búsqueda específica:', error);
        mostrarMensaje('Error de conexión al realizar la búsqueda específica.', 'error');
    }
}
    /* ----------------------------------------------------------- */

    let searchIntent = false; // Variable para controlar si el usuario ha intentado buscar (búsqueda rápida)

	// Función para mostrar/ocultar el formulario
	function toggleCreateForm() {
		showCreateForm = !showCreateForm;
	}
	// Función para mostrar mensajes
	function mostrarMensaje(texto, tipo = 'info') {
		mensaje = texto;
		tipoMensaje = tipo;
		setTimeout(() => (mensaje = ''), 5000);
	}

	// Devolver todos los parques nacionales
	async function getNationalParks() {
		resultStatus = result = '';
		try {
			const res = await fetch(API, { method: 'GET' });
			const data = await res.json();

			// Reordenar si hay highlight
			const highlight = $page.url.searchParams.get('highlight');
			if (highlight) {
				const idx = data.findIndex((p) => p.national_park === highlight);
				if (idx > -1) {
					const [park] = data.splice(idx, 1);
					data.unshift(park);
					// Desactivar la ordenación personalizada
					isCustomSorted = false;
				}
			}

			national_parks = data;

			// Verificar si no hay parques y mostrar mensaje
			if (national_parks.length === 0) {
				result = "No hay datos de parques nacionales. Utiliza el botón 'Cargar datos iniciales'.";
				resultStatus = 'warning';
			}

			console.log(`Response received: \n${JSON.stringify(national_parks, null, 2)}`);
		} catch (error) {
			console.log(`Error getting data from ${API}: ${error}`);
			result = 'Error obteniendo datos de parques nacionales.';
			resultStatus = 'error';
		}
	}

	// Crear un nuevo parque nacional
	async function createNationalPark() {
		// Resetea los mensajes
		result = resultStatus = '';
		mensaje = '';

		// Guarda el nombre para usarlo después
		const parkNameToHighlight = newNationalParkName;

		try {
			const res = await fetch(API, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					national_park: newNationalParkName,
					declaration_date: newDeclarationDate,
					autonomous_community: newAutonomousCommunity,
					initial_area: newInitialArea,
					current_area: newCurrentArea
				})
			});

			if (res.status === 201) {
				console.log(`National Park created successfully: ${parkNameToHighlight}`);
				mostrarMensaje('Parque nacional creado correctamente', 'success');

				// Ocultar el formulario después de crear
				showCreateForm = false;

				// Desactivar la ordenación personalizada para que el nuevo parque aparezca arriba
				isCustomSorted = false;
				// Limpiar los campos del formulario
				newNationalParkName = '';
				newDeclarationDate = '';
				newAutonomousCommunity = '';
				newInitialArea = '';
				newCurrentArea = '';

				// Obtener la lista actualizada y procesarla manualmente
				const fetchRes = await fetch(API, { method: 'GET' });
				const data = await fetchRes.json();

				// Encuentra el nuevo parque y colócalo primero
				const idx = data.findIndex((p) => p.national_park === parkNameToHighlight);
				if (idx > -1) {
					const [park] = data.splice(idx, 1);
					data.unshift(park);
				}

				national_parks = data;
			} else {
				console.log(`Failed to create national park: ${res.status}`);
				mostrarMensaje('Error al crear el parque nacional', 'error');
			}
		} catch (error) {
			console.log(`Error creating the National Park ${API}: ${error}`);
			mostrarMensaje('Error de conexión al crear el parque nacional', 'error');
		}
	}

	// Eliminar un parque nacional
	async function deleteNationalPark(national_park) {
		mensaje = '';

		try {
			const res = await fetch(`${API}/${national_park}`, { method: 'DELETE' });
			const status = await res.status;

			if (status == 200) {
				console.log(`National Park '${national_park}' deleted successfully`);
				mostrarMensaje(`Parque nacional '${national_park}' eliminado correctamente`, 'success');
				getNationalParks();
			} else {
				console.log(`Error deleting National Park ${national_park}: status received ${status}`);
				mostrarMensaje(`Error al eliminar el parque nacional '${national_park}'`, 'error');
			}
		} catch (error) {
			console.log(`Error deleting data from ${API}: ${error}`);
			mostrarMensaje('Error de conexión al eliminar el parque nacional', 'error');
		}
	}

	//Borrar todos los parques nacionales
	async function deleteAllNationalParks() {
		mensaje = '';

		if (national_parks.length === 0) {
			mostrarMensaje('No hay parques nacionales para borrar.', 'info');
			return;
		}

		try {
			const res = await fetch(API, { method: 'DELETE' });
			const status = await res.status;

			if (status == 200) {
				console.log('All National Parks deleted successfully');
				mostrarMensaje('Todos los parques nacionales han sido borrados.', 'success');
				getNationalParks(); // Refresh the list after deletion
			} else {
				console.log(`Error deleting all national parks: status received ${status}`);
				mostrarMensaje('Error borrando todos los parques nacionales.', 'error');
			}
		} catch (error) {
			console.log(`Error deleting data from ${API}: ${error}`);
			mostrarMensaje('Error de conexión al borrar los parques nacionales.', 'error');
		}
	}

	//loadInitialData
	async function loadInitialData() {
		mensaje = '';

		try {
			// Usa el endpoint específico para cargar datos iniciales
			const res = await fetch(`${API}/loadInitialData`, { method: 'GET' });

			if (res.ok) {
				console.log('Initial data loaded successfully');
				mostrarMensaje('Datos iniciales cargados correctamente.', 'success');
				// Refresca la lista de parques
				await getNationalParks();
			} else {
				console.log(`Error loading initial data: status received ${res.status}`);
				mostrarMensaje('Error al cargar los datos iniciales.', 'error');
			}
		} catch (error) {
			console.log(`Error loading initial data: ${error}`);
			mostrarMensaje('Error de conexión al cargar los datos iniciales.', 'error');
		}
	}

	onMount(async () => {
		getNationalParks();
	});
</script>

<svelte:head>
	<title>Parques Nacionales</title>
</svelte:head>

<h2 style="text-align: center; margin-top: 1rem; margin-bottom: 1rem;">
	Parques Nacionales de España
</h2>
<!-- Botonera de acceso rápidos -->
<div style="text-align: center; margin-bottom: 1rem;">
	<Button color="danger" on:click={deleteAllNationalParks}>Borrar todo</Button>
	<Button color="secondary" on:click={loadInitialData}>Cargar datos iniciales</Button>
	<Button color="success" on:click={toggleCreateForm}>
		{showCreateForm ? 'Cancelar' : 'Crear Parque'}
	</Button>
	<Button color="info" on:click={toggleSearchForm}>
		{showSearchForm ? 'Cerrar filtrado' : 'Filtrar parques'}
	</Button>
</div>
<!-- Búsqueda rápida por comunidad autónoma y año de declaración -->
<div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; margin-bottom: 1.5rem; gap: 10px; background-color: #f0f8ff; padding: 10px 10px 5px 10px; border-radius: 5px;">
    <div style="margin-bottom: 5px; display: flex; align-items: center; height: 38px;">
        <strong>Búsqueda rápida:</strong>
    </div>
    
    <div style="width: 200px; position: relative; margin-bottom: 5px;">
        <input 
            class="form-control"
            style={!searchParams.autonomous_community && searchIntent ? "border-color: #dc3545;" : ""}
            placeholder="Comunidad Autónoma" 
            bind:value={searchParams.autonomous_community}
        />
        <div style="position: absolute; left: 0; top: 100%; color: #dc3545; font-size: 0.875em;">
            {#if !searchParams.autonomous_community && searchIntent}
                Debes especificar una comunidad autónoma
            {/if}
        </div>
    </div>
    
    <div style="width: 120px; position: relative; margin-bottom: 5px;">
        <input 
            class="form-control"
            style={!searchParams.from && searchIntent ? "border-color: #dc3545;" : ""} 
            type="number" 
            placeholder="Año" 
            bind:value={searchParams.from}
            on:input={() => searchParams.to = searchParams.from}
            min="1800" 
            max={new Date().getFullYear()}
        />
        <div style="position: absolute; left: 0; top: 100%; color: #dc3545; font-size: 0.875em;">
            {#if !searchParams.from && searchIntent}
                Debes especificar un año
            {/if}
        </div>
    </div>
    
    <div style="margin-bottom: 5px;">
        <Button 
            color="primary" 
            on:click={() => {
                searchIntent = true;
                if (searchParams.autonomous_community && searchParams.from) {
                    searchByCommunityAndYear();
                }
            }}
            style="margin-right: 0.5rem;"
        >
            Buscar por Comunidad y Año
        </Button>
        <Button 
            color="secondary" 
            on:click={() => {
                searchIntent = false;
                clearSearchForm();
            }}
        >
            Limpiar
        </Button>
    </div>
</div>
<!-- Formulario de búsqueda -->
{#if showSearchForm}
	<div
		style="margin-bottom: 1.5rem; padding: 1rem; background-color: #f8f9fa; border-radius: 0.3rem;"
	>
		<h4 style="margin-bottom: 1rem;">Filtrar Parques Nacionales</h4>

		<div class="row mb-3">
			<div class="col">
				<label for="searchName">Nombre del Parque:</label>
				<input
					id="searchName"
					class="form-control"
					bind:value={searchParams.national_park}
					placeholder="Ej: Sierra Nevada"
				/>
			</div>
			<div class="col">
				<label for="searchCommunity">Comunidad Autónoma:</label>
				<input
					id="searchCommunity"
					class="form-control"
					bind:value={searchParams.autonomous_community}
					placeholder="Ej: Andalucía"
				/>
			</div>
		</div>

		<div class="row mb-3">
			<div class="col">
				<label for="searchFrom">Año desde:</label>
				<input
					id="searchFrom"
					class="form-control"
					type="number"
					bind:value={searchParams.from}
					min="1800"
					max={new Date().getFullYear()}
					placeholder="Ej: 1950"
				/>
			</div>
			<div class="col">
				<label for="searchTo">Año hasta:</label>
				<input
					id="searchTo"
					class="form-control"
					type="number"
					bind:value={searchParams.to}
					min="1800"
					max={new Date().getFullYear()}
					placeholder="Ej: 2020"
				/>
			</div>
		</div>

		<div class="row mb-3">
			<div class="col">
				<label for="searchInitAreaMin">Área inicial mínima (ha):</label>
				<input
					id="searchInitAreaMin"
					class="form-control"
					type="number"
					bind:value={searchParams.initial_area_min}
					min="1"
					placeholder="Ej: 5000"
				/>
			</div>
			<div class="col">
				<label for="searchInitAreaMax">Área inicial máxima (ha):</label>
				<input
					id="searchInitAreaMax"
					class="form-control"
					type="number"
					bind:value={searchParams.initial_area_max}
					min="1"
					placeholder="Ej: 50000"
				/>
			</div>
		</div>

		<div class="row mb-3">
			<div class="col">
				<label for="searchCurrAreaMin">Área actual mínima (ha):</label>
				<input
					id="searchCurrAreaMin"
					class="form-control"
					type="number"
					bind:value={searchParams.current_area_min}
					min="1"
					placeholder="Ej: 5000"
				/>
			</div>
			<div class="col">
				<label for="searchCurrAreaMax">Área actual máxima (ha):</label>
				<input
					id="searchCurrAreaMax"
					class="form-control"
					type="number"
					bind:value={searchParams.current_area_max}
					min="1"
					placeholder="Ej: 50000"
				/>
			</div>
		</div>

		<div class="text-center">
			<Button color="primary" on:click={searchNationalParks} style="margin-right: 0.5rem;">
				Buscar
			</Button>
			<Button color="secondary" on:click={clearSearchForm}>Limpiar</Button>
		</div>
	</div>
{/if}

<!-- Componente de mensaje -->
{#if mensaje}
	<Alert
		color={tipoMensaje === 'success'
			? 'success'
			: tipoMensaje === 'error'
				? 'danger'
				: tipoMensaje === 'warning'
					? 'warning'
					: 'info'}
		isOpen={!!mensaje}
		toggle={() => (mensaje = '')}
		className="text-center fw-bold"
		style="margin: 0 auto 1rem auto; max-width: 600px;"
	>
		{mensaje}
	</Alert>
{/if}
<!-- Formulario desplegable para crear nuevo parque -->
{#if showCreateForm}
	<div
		style="margin-bottom: 1.5rem; padding: 1rem; background-color: #f8f9fa; border-radius: 0.3rem;"
	>
		<h4 style="margin-bottom: 1rem;">Crear Nuevo Parque Nacional</h4>

		<!-- Coloca el Alert fuera de la estructura de fila -->
		{#if result}
			<Alert
				color={resultStatus === 'success'
					? 'success'
					: resultStatus === 'error'
						? 'danger'
						: resultStatus === 'warning'
							? 'warning'
							: 'info'}
				isOpen={!!result}
				toggle={() => (result = '')}
				className="text-center fw-bold"
				style="margin-bottom: 1rem;"
			>
				{result}
			</Alert>
		{/if}

		<div class="row">
			<!-- Añade el campo para el nombre del parque que faltaba -->
			<div class="col">
				<label for="parkName">Nombre del Parque:</label>
				<input
					id="parkName"
					class="form-control"
					bind:value={newNationalParkName}
					placeholder="Ej: Sierra de las Nieves"
				/>
			</div>
			<div class="col">
				<label for="declarationDate">Año de declaración:</label>
				<input
					id="declarationDate"
					class="form-control"
					type="number"
					bind:value={newDeclarationDate}
					min="1800"
					max={new Date().getFullYear()}
					placeholder="Ej: 1999"
				/>
			</div>
			<div class="col">
				<label for="community">Comunidad Autónoma:</label>
				<input
					id="community"
					class="form-control"
					bind:value={newAutonomousCommunity}
					placeholder="Ej: Andalucía"
				/>
			</div>
			<div class="col">
				<label for="initialArea">Superficie inicial (ha):</label>
				<input
					id="initialArea"
					class="form-control"
					type="number"
					bind:value={newInitialArea}
					min="1"
					placeholder="Ej: 10000"
				/>
			</div>
			<div class="col">
				<label for="currentArea">Superficie actual (ha):</label>
				<input
					id="currentArea"
					class="form-control"
					type="number"
					bind:value={newCurrentArea}
					min="1"
					placeholder="Ej: 12000"
				/>
			</div>
			<div class="col-auto d-flex align-items-end">
				<Button color="primary" on:click={createNationalPark} style="margin-top: 1.5rem;">
					Crear
				</Button>
			</div>
		</div>
	</div>
{/if}
<Table hover>
	<thead>
		<tr>
			<th style="cursor: pointer" on:click={() => sortBy('national_park')}>
				Nombre {sortField === 'national_park' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
			</th>
			<th style="cursor: pointer" on:click={() => sortBy('declaration_date')}>
				Fecha de declaración {sortField === 'declaration_date'
					? sortDirection === 'asc'
						? '↑'
						: '↓'
					: ''}
			</th>
			<th style="cursor: pointer" on:click={() => sortBy('autonomous_community')}>
				Comunidad Autónoma {sortField === 'autonomous_community'
					? sortDirection === 'asc'
						? '↑'
						: '↓'
					: ''}
			</th>
			<th style="cursor: pointer" on:click={() => sortBy('initial_area')}>
				Área inicial (ha) {sortField === 'initial_area'
					? sortDirection === 'asc'
						? '↑'
						: '↓'
					: ''}
			</th>
			<th style="cursor: pointer" on:click={() => sortBy('current_area')}>
				Área actual (ha) {sortField === 'current_area' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
			</th>
			<th>Acciones</th>
		</tr>
	</thead>
	<tbody>
		{#each sortedParks as park}
			<tr>
				<td><a href="/national-parks/{park.national_park}">{park.national_park}</a></td>
				<td>{park.declaration_date}</td>
				<td>{park.autonomous_community}</td>
				<td>{park.initial_area}</td>
				<td>{park.current_area}</td>
				<td>
					<Button color="danger" on:click={() => deleteNationalPark(park.national_park)}
						>Eliminar</Button
					>
				</td>
			</tr>
		{/each}
	</tbody>
</Table>
