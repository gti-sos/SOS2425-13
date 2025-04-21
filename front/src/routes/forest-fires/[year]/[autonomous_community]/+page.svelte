<script>
	//@ts-nocheck
	//@ts-ignore
	import { onMount } from 'svelte';
	import { Button, Table, Alert } from '@sveltestrap/sveltestrap';
	import { dev } from '$app/environment'; // Importing the dev variable to check the environment
	import { page } from '$app/stores'; // Importing the page store to access route parameters
	import { goto } from '$app/navigation'; // Importing goto for navigation
	
	const BASE_URL = dev ? 'http://localhost:16078' : 'https://sos2425-13.onrender.com';

	let year, autonomous_community;
	let number_of_accidents = '';
	let percentage_of_large_fires = '';
	let mensaje = '';
	let error = '';
	let cargando = false;

	$: ({ year, autonomous_community } = $page.params);

	const cargarDato = async () => {
  cargando = true;
  try {
    // Use the base URL in dev environment
    const apiUrl = dev 
      ? `${BASE_URL}/api/v1/forest-fires/${year}/${encodeURIComponent(autonomous_community)}`
      : `/api/v1/forest-fires/${year}/${encodeURIComponent(autonomous_community)}`;
    
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (res.ok) {
      number_of_accidents = data.number_of_accidents;
      percentage_of_large_fires = data.percentage_of_large_fires;
      mensaje = '';
      error = '';
    } else {
      error = data.message || '❌ No se pudo encontrar el recurso.';
    }
  } catch (e) {
    error = '❌ Error al conectar con el servidor.';
  } finally {
    cargando = false;
  }
};

const guardarCambios = async () => {
    error = '';
    mensaje = '';

    const accidentes = parseInt(number_of_accidents);
    const porcentaje = parseFloat(percentage_of_large_fires);

    if (isNaN(accidentes) || isNaN(porcentaje) || porcentaje < 0 || porcentaje > 1) {
        error = '❌ Asegúrate de que los datos son numéricos y el porcentaje está entre 0 y 1.';
        return;
    }

    cargando = true;

    try {
        // URL con BASE_URL para desarrollo
        const apiUrl = dev 
            ? `${BASE_URL}/api/v1/forest-fires/${year}/${encodeURIComponent(autonomous_community)}`
            : `/api/v1/forest-fires/${year}/${encodeURIComponent(autonomous_community)}`;
        
        const res = await fetch(apiUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                year: parseInt(year),
                autonomous_community,
                number_of_accidents: accidentes,
                percentage_of_large_fires: porcentaje
            })
        });

        const data = await res.json();

        if (res.ok) {
            mensaje = '✅ Cambios guardados correctamente.';
            setTimeout(() => goto('/forest-fires'), 10000);
        } else if (res.status === 409) {
            error = '❌ No se puede cambiar el año o la comunidad. Son datos únicos.';
        } else if (res.status === 404) {
            error = `❌ No existe un incendio registrado para "${autonomous_community}" en ${year}.`;
        } else if (res.status === 400) {
            error = '❌ Faltan campos o hay datos inválidos.';
        } else {
            error = '❌ Error desconocido al guardar los cambios.';
        }
    } catch (e) {
        error = '❌ Error al conectar con el servidor.';
    } finally {
        cargando = false;
    }
};

const eliminarRecurso = async () => {
    if (!confirm(`¿Estás seguro de eliminar el incendio de ${autonomous_community} en ${year}?`))
        return;

    cargando = true;

    try {
        // URL con BASE_URL para desarrollo
        const apiUrl = dev 
            ? `${BASE_URL}/api/v1/forest-fires/${year}/${encodeURIComponent(autonomous_community)}`
            : `/api/v1/forest-fires/${year}/${encodeURIComponent(autonomous_community)}`;
        
        const res = await fetch(apiUrl, {
            method: 'DELETE'
        });

        const data = await res.json();

        if (res.ok) {
            mensaje = data.message || '✅ Recurso eliminado correctamente.';
            setTimeout(() => goto('/forest-fires'), 1000);
        } else {
            error = data.error || '❌ Error al eliminar el recurso.';
        }
    } catch (e) {
        error = '❌ Error al conectar con el servidor.';
    } finally {
        cargando = false;
    }
};

	onMount(cargarDato);
</script>

<main class="container mt-4">
	<h1 class="mb-4">✏️ Editar incendio: {autonomous_community} - {year}</h1>

	{#if mensaje}
		<div class="alert alert-success" role="alert" aria-live="polite">{mensaje}</div>
	{/if}

	{#if error}
		<div class="alert alert-danger" role="alert" aria-live="polite">{error}</div>
	{/if}

	{#if cargando}
		<p>⏳ Cargando datos...</p>
	{/if}

	<form on:submit|preventDefault={guardarCambios}>
		<div class="form-group mb-3">
			<label for="accidentes">Número de accidentes forestales</label>
			<input
				id="accidentes"
				type="number"
				class="form-control"
				bind:value={number_of_accidents}
				required
				min="0"
			/>
		</div>

		<div class="form-group mb-3">
			<label for="porcentaje">Porcentaje de grandes incendios (0 a 1)</label>
			<input
				id="porcentaje"
				type="number"
				step="0.01"
				min="0"
				max="1"
				class="form-control"
				bind:value={percentage_of_large_fires}
				required
			/>
		</div>

		<div class="d-flex gap-2 mt-3">
			<button type="submit" class="btn btn-info" disabled={cargando}>
				{cargando ? 'Guardando...' : '💾 Guardar cambios'}
			</button>
			<button type="button" class="btn btn-danger" on:click={eliminarRecurso} disabled={cargando}>
				{cargando ? 'Eliminando...' : '🗑️ Eliminar'}
			</button>
			<button type="button" class="btn btn-secondary" on:click={() => goto('/forest-fires')}>
				❌ Cancelar
			</button>
		</div>
	</form>
</main>

<style>
	h1 {
		font-weight: bold;
	}
</style>
