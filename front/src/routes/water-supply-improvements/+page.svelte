<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { messageStore } from '$lib/stores/messageStore';

	interface Datos {
		year: number;
		autonomous_community: string;
		amount: number;
		benefited_population: number;
		project_count: number;
		original_autonomous_community?: string;
	}

	// Normalizar el nombre de la comunidad (minúsculas y sin tildes)
	function normalizeCommunity(input: string): string {
		return input
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
			.replace(/[,]/g, '')
			.replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
			.trim();
	}

	// Formatear la comunidad para mostrarla con mayúsculas y tildes
	function formatCommunity(input: string): string {
		const map: Record<string, string> = {
			andalucia: 'Andalucía',
			aragon: 'Aragón',
			asturias: 'Asturias',
			baleares: 'Baleares',
			canarias: 'Canarias',
			cantabria: 'Cantabria',
			'castilla y leon': 'Castilla y León',
			'castilla-la mancha': 'Castilla-La Mancha',
			catalunia: 'Cataluña',
			valencia: 'Valencia',
			extremadura: 'Extremadura',
			galicia: 'Galicia',
			madrid: 'Madrid',
			murcia: 'Murcia',
			'pais vasco': 'País Vasco'
		};

		const normalized = normalizeCommunity(input);
		return map[normalized] || input.charAt(0).toUpperCase() + input.slice(1); // Capitalizar si no se encuentra en el mapa
	}

	let datos: Datos[] = [];
	let mensaje = '';
	let tipoMensaje: string = 'primary';
	let limit = 5;
	let offset = 0;
	const BASE_URL = dev ? 'http://localhost:16078' : 'https://sos2425-13.onrender.com';
	const API = `${BASE_URL}/api/v1/water-supply-improvements`;

	let filtrosAplicados = '';
	let query = `?limit=${limit}&offset=${offset}`;
	let tipoFiltro: 'busqueda' | 'filtro' | null = null;

	// Opciones para el número de elementos por página
	const itemsPerPageOptions = [5, 10, 15, 20, 25];

	// Función para cambiar el número de elementos por página
	function cambiarItemsPorPagina(nuevoLimit: number) {
		limit = nuevoLimit;
		offset = 0; // Resetear el offset al cambiar el límite
		aplicarPaginacion();
		obtenerDatos();
	}

	// Campos de formulario y búsqueda
	let year = '';
	let comunidad = '';
	let cantidad = '';
	let poblacion = '';
	let proyectos = '';

	let busquedaYear = '';
	let busquedaComunidad = '';
	let busquedaCantidad = '';
	let busquedaPoblacion = '';
	let busquedaProyectos = '';

	let desde = '';
	let hasta = '';

	let editMode = false;
	let currentEdit: Datos | null = null;

	let showSearchModal = false;
	let showFilterModal = false;
	let showCreateModal = false;
	let showDeleteModal = false;
	let showTable = false;
	let datosIniciales = false;

	onMount(() => {
		const unsubscribe = messageStore.subscribe((value) => {
			if (value) {
				mensaje = value.message;
				tipoMensaje = value.type;
				setTimeout(() => {
					mensaje = '';
					messageStore.set(null);
				}, 3000);
			}
		});
		// Verificar si ya hay datos al montar el componente
		verificarDatos();
		return () => unsubscribe();
	});

	// Verificar si ya existen datos
	async function verificarDatos() {
		try {
			const res = await fetch(API);
			if (res.ok) {
				const data = await res.json();
				if (data && data.length > 0) {
					datosIniciales = true;
					showTable = true;
					await obtenerDatos();
				}
			}
		} catch (error) {
			console.error('Error al verificar datos:', error);
		}
	}

	// Obtener los datos de la API
	async function obtenerDatos() {
		try {
			const res = await fetch(API + query);
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || 'Error al obtener datos');
			}

			const data = await res.json(); // Obtener la respuesta
			if (data.length === 0) {
				// Si no hay datos, vaciar la tabla y mostrar mensaje
				datos = []; // Limpiar los datos de la tabla
				showTable = false; // Ocultar la tabla
				mostrarMensaje('⚠️ No se encontraron datos que coincidan con los filtros', 'danger');
			} else {
				// Si se encuentran datos, asignarlos correctamente
				datos = data.map((d: Datos) => ({
					...d,
					original_autonomous_community: d.autonomous_community, // Guardamos el valor original
					autonomous_community: formatCommunity(d.autonomous_community) // Mostramos el valor con formato
				}));
				showTable = true; // Mostrar la tabla
			}
		} catch (err) {
			mensaje = err instanceof Error ? err.message : 'Error desconocido';
			tipoMensaje = 'danger';
		}
	}

	// Mostrar mensajes de error o éxito
	function mostrarMensaje(texto: string, tipo: typeof tipoMensaje = 'info') {
		mensaje = texto;
		tipoMensaje = tipo;
		setTimeout(() => (mensaje = ''), 4000);
	}

	// Cargar los datos iniciales
	async function cargarIniciales() {
		try {
			const res = await fetch(API + '/loadInitialData');
			if (res.ok) {
				mostrarMensaje('✅ Datos iniciales cargados', 'success');
				datosIniciales = true;
				showTable = true;
				await obtenerDatos();
			} else {
				throw new Error();
			}
		} catch {
			mostrarMensaje('⚠️ Ya existen datos iniciales', 'warning');
			datosIniciales = true;
			showTable = true;
			await obtenerDatos();
		}
	}

	// Limpiar formulario
	function limpiarFormulario() {
		year = comunidad = cantidad = poblacion = proyectos = '';
	}

	// Crear un nuevo recurso

	async function crear() {
    // Validar que todos los campos necesarios estén completos
    if (!year || !comunidad || !cantidad || !poblacion || !proyectos) {
        return mostrarMensaje('⚠️ Todos los campos son obligatorios', 'danger');
    }

    try {
        const nuevo: Datos = {
            year: +year,
            autonomous_community: normalizeCommunity(comunidad), // Guardar en formato original (sin mayúsculas ni tildes)
            amount: +cantidad,
            benefited_population: +poblacion,
            project_count: +proyectos
        };

        // Agregar el nuevo recurso a los datos localmente (para mostrarlo de inmediato en la tabla)
        datos = [
            { ...nuevo, autonomous_community: formatCommunity(nuevo.autonomous_community) },
            ...datos
        ];

        // Limpiar el formulario después de agregar el recurso
        limpiarFormulario();

        // Realizar la solicitud al backend para persistir los datos
        const res = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevo)
        });

        if (res.status === 201) {
            mostrarMensaje('✅ Recurso creado', 'success');

            // Recargar los datos desde la API para asegurar que la tabla tenga los datos más actualizados
            await obtenerDatos(); // Recargar los datos después de crear el recurso
        } else if (res.status === 409) {
            mostrarMensaje('⚠️ Recurso ya existe', 'warning');
            // Eliminar el recurso localmente si el servidor devuelve un conflicto
            datos = datos.filter(
                (d) => d.year !== nuevo.year || d.autonomous_community !== nuevo.autonomous_community
            );
        } else if (res.status === 400) {
            mostrarMensaje('⚠️ Campos incompletos', 'warning');
        } else {
            const err = await res.json();
            throw new Error(err.error);
        }
    } catch (e) {
        mostrarMensaje(e instanceof Error ? e.message : 'Error al crear', 'danger');
    }
}


	// Eliminar todos los recursos

	async function eliminarTodo() {
		try {
			const res = await fetch(API, { method: 'DELETE' });
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error);
			}
			datos = [];
			datosIniciales = false;
			showTable = false;
			limpiarFiltros(); // Eliminar los filtros al eliminar los datos
			mostrarMensaje('🗑️ Todos los datos eliminados', 'success');
		} catch (e) {
			mostrarMensaje(e instanceof Error ? e.message : 'Error al eliminar', 'danger');
		}
	}

	// Aplicar paginación
	function aplicarPaginacion() {
		query = `?limit=${limit}&offset=${offset}${filtrosAplicados}`;
	}

	// Navegar a la página anterior
	function paginaAnterior() {
		if (offset >= limit) {
			offset -= limit;
			aplicarPaginacion();
			obtenerDatos();
		} else mostrarMensaje('⚠️ Primera página', 'warning');
	}

	// Navegar a la siguiente página
	function siguientePagina() {
		offset += limit;
		aplicarPaginacion();
		obtenerDatos();
	}

	// Filtrar por campos
	function buildFilters() {
		const f: string[] = [];
		if (busquedaYear) f.push(`year=${busquedaYear}`);
		if (busquedaComunidad) f.push(`autonomous_community=${normalizeCommunity(busquedaComunidad)}`);
		if (busquedaCantidad) f.push(`amount=${busquedaCantidad}`);
		if (busquedaPoblacion) f.push(`benefited_population=${busquedaPoblacion}`);
		if (busquedaProyectos) f.push(`project_count=${busquedaProyectos}`);
		filtrosAplicados = f.length ? '&' + f.join('&') : '';
		offset = 0;
		tipoFiltro = 'filtro';
		aplicarPaginacion();
		obtenerDatos();
	}

	// Buscar por intervalo de años
	function buscarIntervalo() {
		const f: string[] = [];
		if (desde) f.push(`from=${desde}`);
		if (hasta) f.push(`to=${hasta}`);
		filtrosAplicados = f.length ? '&' + f.join('&') : '';
		offset = 0;
		tipoFiltro = 'busqueda';
		aplicarPaginacion();
		obtenerDatos(); // Llamar a obtenerDatos para actualizar la tabla
		mostrarMensaje('🕒 Intervalo aplicado', 'info');
	}

	// Editar un recurso
	function editarRecurso(r: Datos) {
		// Validar si r tiene los valores necesarios
		if (!r.year || !r.autonomous_community) {
			return mostrarMensaje('⚠️ Recurso incompleto', 'danger');
		}

		currentEdit = { ...r };
		editMode = true;
		goto(
			`/water-supply-improvements/${r.year}/${encodeURIComponent(r.original_autonomous_community || '')}`
		);
	}

	// Eliminar un recurso
	async function eliminarRecurso(r: Datos) {
		// Validar que el recurso tenga año y comunidad antes de eliminar
		if (!r.year || !r.original_autonomous_community) {
			return mostrarMensaje('⚠️ Datos incompletos para eliminar', 'danger');
		}

		try {
			const res = await fetch(
				`${API}/${r.year}/${encodeURIComponent(r.original_autonomous_community)}`,
				{ method: 'DELETE' }
			);
			if (res.ok) {
				datos = datos.filter(
					(d) =>
						d.year !== r.year || d.original_autonomous_community !== r.original_autonomous_community
				);
				mostrarMensaje('🗑️ Recurso eliminado', 'success');
			} else {
				const err = await res.json();
				throw new Error(err.error);
			}
		} catch (e) {
			mostrarMensaje(e instanceof Error ? e.message : 'Error al eliminar', 'danger');
		}
	}

	function confirmarEliminarTodo() {
		showDeleteModal = true;
	}

	// Función para limpiar todos los filtros
	function limpiarFiltros() {
		filtrosAplicados = '';
		busquedaYear = '';
		busquedaComunidad = '';
		busquedaCantidad = '';
		busquedaPoblacion = '';
		busquedaProyectos = '';
		desde = '';
		hasta = '';
		offset = 0;
		tipoFiltro = null;
		aplicarPaginacion();
		obtenerDatos();
		mostrarMensaje('🧹 Filtros eliminados', 'info');
	}
	// Manejador para el botón de búsqueda con 'Enter'
	function handleEnterPressSearch(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			buscarIntervalo(); // Llamar a la función de búsqueda
			showSearchModal = false; // Cerrar el modal
		}
	}

	// Manejador para el botón de filtro con 'Enter'
	function handleEnterPressFilter(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			buildFilters(); // Llamar a la función de filtros
			showFilterModal = false; // Cerrar el modal
		}
	}

	// Manejador para el botón de crear con 'Enter'
	function handleEnterPressCreate(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			crear(); // Llamar a la función de creación
			showCreateModal = false; // Cerrar el modal
		}
	}
</script>

<svelte:head>
	<title>Gestión de Recursos de Abastecimiento de Agua</title>
</svelte:head>

<div class="water-supply-page">
	<div class="container">
		{#if mensaje}
			<div class="alert alert-{tipoMensaje}">{mensaje}</div>
		{/if}

		<h1><span class="highlight">Suministro de Agua</span></h1>

		<div class="actions-bar">
			<button class="btn btn-info" on:click={cargarIniciales}>Cargar datos</button>
			<button class="btn btn-primary" on:click={() => (showSearchModal = true)}>Buscar</button>
			<button class="btn btn-warning" on:click={() => (showFilterModal = true)}>Filtrar</button>
			<button class="btn btn-success" on:click={() => (showCreateModal = true)}>Añadir</button>
			<button class="btn btn-danger" on:click={confirmarEliminarTodo}>Eliminar todo</button>
		</div>

		{#if showTable}
			{#if filtrosAplicados}
				<div class="clear-filters-bar">
					<button
						class="btn {tipoFiltro === 'busqueda' ? 'btn-primary' : 'btn-warning'}"
						on:click={limpiarFiltros}>Limpiar filtros</button
					>
				</div>
			{/if}
			<div class="section card table-wrapper">
				<table>
					<thead>
						<tr>
							<th>Año</th>
							<th>Comunidad</th>
							<th>Cantidad (€)</th>
							<th>Población</th>
							<th>Proyectos</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{#each datos as d}
							<tr>
								<td>{d.year}</td>
								<td>{d.autonomous_community}</td>
								<td>{d.amount.toLocaleString()}</td>
								<td>{d.benefited_population.toLocaleString()}</td>
								<td>{d.project_count}</td>
								<td class="actions">
									<button class="btn btn-warning btn-sm" on:click={() => editarRecurso(d)}
										>Editar</button
									>
									<button class="btn btn-danger btn-sm" on:click={() => eliminarRecurso(d)}
										>Eliminar</button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<div class="table-actions">
				<div class="pagination-controls">
					<button class="btn btn-outline" on:click={paginaAnterior}>Anterior</button>
					<button class="btn btn-outline" on:click={siguientePagina}>Siguiente</button>
				</div>
				<div class="items-selector">
					<select
						class="btn btn-outline"
						on:change={(e) => {
							const target = e.target as HTMLSelectElement;
							cambiarItemsPorPagina(Number(target.value));
						}}
					>
						{#each itemsPerPageOptions as option}
							<option value={option} selected={limit === option}>{option} elementos</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}

		<!-- Modal de Búsqueda -->

		{#if showSearchModal}
			<div class="modal-backdrop" on:click={() => (showSearchModal = false)}>
				<div class="modal-content" on:click|stopPropagation>
					<h3>Búsqueda por intervalo de años</h3>
					<div class="form-group">
						<input
							type="number"
							placeholder="Desde"
							bind:value={desde}
							on:keydown={handleEnterPressSearch}
						/>
						<input
							type="number"
							placeholder="Hasta"
							bind:value={hasta}
							on:keydown={handleEnterPressSearch}
						/>
					</div>
					<div class="modal-actions">
						<button
							class="btn btn-primary"
							on:click={() => {
								buscarIntervalo();
								showSearchModal = false;
							}}>Buscar</button
						>
						<button class="btn btn-outline" on:click={() => (showSearchModal = false)}>
							Cancelar
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Modal de Filtros -->
		{#if showFilterModal}
			<div class="modal-backdrop" on:click={() => (showFilterModal = false)}>
				<div class="modal-content" on:click|stopPropagation>
					<h3>Filtrado por campos</h3>
					<div class="form-group">
						<input
							placeholder="Año"
							bind:value={busquedaYear}
							on:keydown={handleEnterPressFilter}
						/>
						<input
							placeholder="CCAA"
							bind:value={busquedaComunidad}
							on:keydown={handleEnterPressFilter}
						/>
						<input
							placeholder="Cantidad (€)"
							bind:value={busquedaCantidad}
							on:keydown={handleEnterPressFilter}
						/>
						<input
							placeholder="Población"
							bind:value={busquedaPoblacion}
							on:keydown={handleEnterPressFilter}
						/>
						<input
							placeholder="Proyectos"
							bind:value={busquedaProyectos}
							on:keydown={handleEnterPressFilter}
						/>
					</div>
					<div class="modal-actions">
						<button
							class="btn btn-warning"
							on:click={() => {
								buildFilters();
								showFilterModal = false;
							}}>Filtrar</button
						>
						<button class="btn btn-outline" on:click={() => (showFilterModal = false)}>
							Cancelar
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Modal de Crear -->
		{#if showCreateModal}
			<div class="modal-backdrop" on:click={() => (showCreateModal = false)}>
				<div class="modal-content" on:click|stopPropagation>
					<h3>Crear nuevo recurso</h3>
					<div class="form-group">
						<input
							type="number"
							placeholder="Año"
							bind:value={year}
							on:keydown={handleEnterPressCreate}
						/>
						<input placeholder="CCAA" bind:value={comunidad} on:keydown={handleEnterPressCreate} />
						<input
							type="number"
							step="0.01"
							placeholder="Cantidad (€)"
							bind:value={cantidad}
							on:keydown={handleEnterPressCreate}
						/>
						<input
							type="number"
							placeholder="Población"
							bind:value={poblacion}
							on:keydown={handleEnterPressCreate}
						/>
						<input
							type="number"
							placeholder="Proyectos"
							bind:value={proyectos}
							on:keydown={handleEnterPressCreate}
						/>
					</div>
					<div class="modal-actions">
						<button
							class="btn btn-success"
							on:click={() => {
								crear();
								showCreateModal = false;
							}}>Añadir</button
						>
						<button class="btn btn-outline" on:click={() => (showCreateModal = false)}>
							Cancelar
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Modal de Confirmar Eliminación -->
		{#if showDeleteModal}
			<div class="modal-backdrop" on:click={() => (showDeleteModal = false)}>
				<div class="modal-content" on:click|stopPropagation>
					<h3>¿Estás seguro?</h3>
					<p>Esta acción eliminará todos los datos y no se puede deshacer.</p>
					<div class="modal-actions">
						<button
							class="btn btn-danger"
							on:click={() => {
								eliminarTodo();
								showDeleteModal = false;
							}}>Eliminar todo</button
						>
						<button class="btn btn-outline" on:click={() => (showDeleteModal = false)}
							>Cancelar</button
						>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.water-supply-page {
		display: flex;
		flex-direction: column;
		background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
		align-items: center;
		justify-content: flex-start;
		min-height: 100vh;
		width: 100vw;
	}

	.water-supply-page > * {
		text-align: center;
		width: 100%;
	}
	.container {
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		border-radius: 16px;
		margin: 2rem auto;
		max-width: 1100px;
		width: 95%;
		padding: 2rem 2.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	h1,
	h3,
	.actions-bar,
	.table-actions,
	.pagination-controls,
	.items-selector,
	.alert {
		text-align: center;
		margin-left: auto;
		margin-right: auto;
	}

	table {
		margin-left: auto;
		margin-right: auto;
	}

	.section.card.table-wrapper {
		margin-left: auto;
		margin-right: auto;
	}

	h1 {
		color: #333;
		margin-bottom: 1.5rem;
		font-size: 1.75rem;
		font-weight: normal;
		text-align: center;
	}

	h3 {
		font-size: 1.25rem;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: var(--secondary);
	}

	.flex {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	.section {
		margin-bottom: 1.5rem;
	}

	.card {
		background: var(--card-bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1rem;
		box-shadow: 0 2px 6px var(--shadow);
	}

	.table-wrapper {
		overflow-x: auto;
		margin-top: 1rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.75rem 0.5rem;
		border: 1px solid var(--border);
	}

	th {
		background: var(--bg);
		position: sticky;
		top: 0;
	}

	tr:nth-child(even) {
		background: #fafafa;
	}

	tr:hover {
		background: #f1f1f1;
	}

	input {
		flex: 1;
		min-width: 120px;
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 999px;
		cursor: pointer;
		transition: transform 0.1s ease;
	}

	.btn:hover {
		transform: translateY(-1px);
	}

	.btn:active {
		transform: translateY(0);
	}

	.btn-primary {
		background: #007bff;
		color: white;
	}

	.btn-primary:hover {
		background: #0056b3;
	}

	.btn-success {
		background: #28a745;
		color: white;
	}

	.btn-info {
		background: #17a2b8;
		color: white;
	}

	.btn-warning {
		background: #ffc107;
		color: #212529;
	}

	.btn-danger {
		background: #dc3545;
		color: white;
	}

	.btn-outline {
		background: transparent;
		border: 1px solid var(--primary);
		color: var(--primary);
	}

	.btn-sm {
		padding: 0.4rem 0.75rem;
		font-size: 0.85rem;
	}

	.alert {
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		margin-bottom: 1rem;
		font-weight: 500;
	}

	.alert-primary {
		background: rgba(0, 86, 179, 0.1);
		color: var(--primary);
	}

	.alert-success {
		background: rgba(40, 167, 69, 0.1);
		color: #28a745;
	}

	.alert-info {
		background: rgba(23, 162, 184, 0.1);
		color: #17a2b8;
	}

	.alert-warning {
		background: rgba(255, 193, 7, 0.1);
		color: #856404;
	}

	.alert-danger {
		background: rgba(220, 53, 69, 0.1);
		color: #dc3545;
	}

	@media (max-width: 600px) {
		.flex {
			flex-direction: column;
		}
	}

	.highlight {
		color: #000;
		font-weight: bold;
	}

	.actions-bar {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		padding: 2rem;
		border-radius: var(--radius);
		width: 90%;
		max-width: 500px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.table-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
		padding: 0 1rem;
		width: 100%;
	}

	.pagination-controls {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.items-selector {
		margin-left: auto;
	}

	select {
		padding: 0.5rem 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background-color: white;
		cursor: pointer;
		min-width: 120px;
	}

	select:hover {
		background-color: #f8f9fa;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.clear-filters-bar {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		margin-bottom: 0.5rem;
	}
</style>
