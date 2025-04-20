<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation'; // SvelteKit navigation
	import 'bootstrap/dist/css/bootstrap.min.css';
	import { messageStore } from '$lib/stores/messageStore';
	let year = '';
	let autonomousCommunity = '';
	let amount = '';
	let benefitedPopulation = '';
	let projectCount = '';
	let message = '';
	let c = '';
	let isLoading = false;
	let datosCargados = false; // Nueva variable para controlar si los datos están disponibles

	const API = dev
		? 'http://localhost:16078/api/v1/water-supply-improvements'
		: 'https://sos2425-13.onrender.com/api/v1/water-supply-improvements';

	onMount(async () => {
		year = $page.params.year;
		autonomousCommunity = $page.params.autonomous_community;
		await fetchData();
	});

	async function fetchData() {
		try {
			const res = await fetch(`${API}/${year}/${encodeURIComponent(autonomousCommunity)}`);
			console.log('Respuesta del servidor:', res);

			if (!res.ok) {
				let data: any = {};
				try {
					data = await res.json();
				} catch {
					// Si no hay cuerpo JSON
          data ={};
				}
				console.log('Error al cargar datos:', data);
				message =`No existe un dato para ${year} ${autonomousCommunity}`;
				c = 'danger';
				datosCargados = false;
				return;
			}

			const data = await res.json();
			console.log('Datos cargados:', data);
			amount = data.amount;
			benefitedPopulation = data.benefited_population;
			projectCount = data.project_count;
			datosCargados = true;
			message = ''; // Limpia el mensaje de error
		} catch (err) {
			console.error('Error al cargar los datos:', err);
			message = 'Error de conexión al cargar los datos.';
			c = 'danger';
			datosCargados = false;
		}
	}

	async function updateData() {
    isLoading = true;
    message = '';
    c = '';

    const parsedYear = parseInt(year, 10);
    if (isNaN(parsedYear)) {
        message = 'Año inválido.';
        c = 'danger';
        isLoading = false;
        return;
    }

    try {
        const res = await fetch(`${API}/${parsedYear}/${encodeURIComponent(autonomousCommunity)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                year: parsedYear,
                autonomous_community: autonomousCommunity,
                amount: Number(amount),
                benefited_population: Number(benefitedPopulation),
                project_count: Number(projectCount)
            })
        });

        let data: any = {};
        try {
            data = await res.json();
        } catch {
            // No hay cuerpo JSON
        }

        if (res.ok) {
            // Establecer el mensaje en messageStore
            messageStore.set({
                message: '✅ Recurso actualizado correctamente.',
                type: 'success'
            });

            // Redirigir a la página principal
            await goto('/water-supply-improvements');
        } else {
            message = data.error || `❌ Error al actualizar: ${res.status}`;
            c = 'danger';
        }
    } catch (err) {
        console.error('Error al actualizar:', err);
        message = '❌ Error inesperado al conectar con la API.';
        c = 'danger';
    } finally {
        isLoading = false;
    }
}

	async function deleteData() {
		try {
			const res = await fetch(`${API}/${year}/${encodeURIComponent(autonomousCommunity)}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				const data = await res.json();
				messageStore.set({
					message: data.message || '✅ Recurso eliminado correctamente.',
					type: 'success'
				});

				// Redirigir a la página principal
				await goto('/water-supply-improvements');
			} else if (res.status === 404) {
				const errorData = await res.json();
				message = errorData.error || '❌ No se encontró el recurso a eliminar.';
				c = 'warning';
			} else {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Error al eliminar el recurso.');
			}
		} catch (error) {
			message =
				error instanceof Error ? error.message : '❌ Error de conexión al eliminar el recurso.';
			c = 'danger';
		}
	}
</script>

<main class="container my-4">
	{#if message}
		<div class={`alert alert-${c}`} role="alert">{message}</div>
	{/if}

	{#if datosCargados}
		<h1><u>Modificar datos de Abastecimiento de Agua</u></h1>

		<form on:submit|preventDefault={updateData}>
			<div class="form-group">
				<label for="amount">Cantidad (€)</label>
				<input id="amount" class="form-control" type="text" bind:value={amount} />
			</div>
			<div class="form-group">
				<label for="benefitedPopulation">Población Beneficiada</label>
				<input
					id="benefitedPopulation"
					class="form-control"
					type="text"
					bind:value={benefitedPopulation}
				/>
			</div>
			<div class="form-group">
				<label for="projectCount">Proyectos</label>
				<input id="projectCount" class="form-control" type="text" bind:value={projectCount} />
			</div>

			<button type="submit" class="btn btn-info" disabled={isLoading}>
				{isLoading ? 'Actualizando...' : 'Actualizar'}
			</button>
			<button type="button" class="btn btn-danger" on:click={deleteData}>
				{isLoading ? 'Eliminando...' : 'Eliminar'}
			</button>
		</form>
	{/if}

	<br />
	<button class="btn btn-success" on:click={() => goto('/water-supply-improvements')}>
		Volver
	</button>
</main>

<style>
	h1 {
		font-weight: bold;
	}
</style>
