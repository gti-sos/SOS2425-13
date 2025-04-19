<script>
	//@ts-nocheck
	//@ts-ignore
	import { onMount } from 'svelte';
	import { Button, Table, Alert } from '@sveltestrap/sveltestrap';
	import { dev } from '$app/environment'; // Importing the dev variable to check the environment
	import { page } from '$app/stores'; // Importing the page store to access route parameters
	import { goto } from '$app/navigation'; // Importing goto for navigation

	let DEVEL_HOST = 'http://localhost:16078';
	let PRODUCTION_HOST = 'https://sos2425-13.onrender.com';

	let API = '/api/v1/national-parks';
	if (dev) {
		API = DEVEL_HOST + API; // Use development host if in development mode
	} else {
		API = PRODUCTION_HOST + API; // Use production host if in production mode
	}

	let national_park = {};
	let result = '';
	let resultStatus = '';
	let parkName = '';
	$: parkName = $page.params.name;
    let tipoMensaje = '';
    let mensaje = '';

    // Función para mostrar mensajes
    function mostrarMensaje(texto, tipo = "info") {
      mensaje = texto;
      tipoMensaje = tipo;
      setTimeout(() => mensaje = "", 5000);
    }

	// Obtener los datos de un parque nacional específico
	async function getNationalPark() {
		resultStatus = result = '';
		try {
			const res = await fetch(`${API}/${parkName}`, { method: 'GET' });
			const data = await res.json();
			result = JSON.stringify(data, null, 2);
			national_park = data;
			console.log(`Response received: \n${JSON.stringify(national_park, null, 2)}`);
		} catch (error) {
			console.log(`ERROR getting data from ${API}: ${error}`);
		}
	}

	//Actualizar un parque nacional
	async function updateNationalPark() {
    mensaje = '';
    // Construye el objeto solo con los campos editables
    const updatedFields = {
        declaration_date: national_park.declaration_date,
        autonomous_community: national_park.autonomous_community,
        initial_area: national_park.initial_area,
        current_area: national_park.current_area
    };
    try {
        // PUT al endpoint específico del parque
        const res = await fetch(`${API}/${parkName}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedFields)
        });

        if (res.ok) {
            mostrarMensaje("Parque Nacional actualizado correctamente", "success");
            // Espera a que el usuario vea el mensaje antes de redirigir
            setTimeout(() => {
                goto(`/national-parks?highlight=${encodeURIComponent(parkName)}`);
            }, 1500);
        } else {
            mostrarMensaje(`Error actualizando el parque nacional: ${res.status} ${res.statusText}`, "error");
            console.error(`Error actualizando el parque nacional: ${res.status} ${res.statusText}`);
        }
    } catch (error) {
        mostrarMensaje(`Error actualizando el parque nacional: ${error}`, "error");
        console.error(`ERROR enviando datos a ${API}: ${error}`);
    }
}

	// Eliminar un parque nacional
	async function deleteNationalPark(parkName) {
    mensaje = '';
    try {
        const res = await fetch(`${API}/${parkName}`, { method: 'DELETE' });

        if (res.ok) {
            mostrarMensaje("Parque Nacional eliminado correctamente", "success");
            // Espera a que el usuario vea el mensaje antes de redirigir
            setTimeout(() => {
                goto('/national-parks');
            }, 1500);
        } else {
            mostrarMensaje(`Error eliminando el parque nacional: ${res.status} ${res.statusText}`, "error");
            console.error(`Error eliminando el parque nacional: ${res.status} ${res.statusText}`);
        }
    } catch (error) {
        mostrarMensaje(`Error eliminando el parque nacional: ${error}`, "error");
        console.error(`ERROR eliminando datos en ${API}: ${error}`);
    }
}
	onMount(async () => {
		getNationalPark();
	});
</script>

<h2 style="text-align: center; margin-top: 1rem; margin-bottom: 1rem;">
	Detalles del Parque Nacional: {national_park.national_park}
</h2>

<!-- Añade este bloque para mostrar mensajes -->
{#if mensaje}
    <Alert 
        color={tipoMensaje === 'success' ? 'success' : 
              tipoMensaje === 'error' ? 'danger' : 
              tipoMensaje === 'warning' ? 'warning' : 'info'} 
        isOpen={!!mensaje} 
        toggle={() => mensaje = ''}
        className="text-center fw-bold"
        style="margin: 0 auto 1rem auto; max-width: 600px;"
    >
        {mensaje}
    </Alert>
{/if}


<Table hover>
	<thead>
		<tr>
			<th>Nombre</th>
			<th>Fecha de declaración</th>
			<th>Comunidad Autónoma</th>
			<th>Superficie inicial (ha)</th>
			<th>Superficie actual (ha)</th>
			<th>Acciones</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>{national_park.national_park}</td>
			<td>
				<input
					bind:value={national_park.declaration_date}
					type="number"
					min="0"
					max={new Date().getFullYear()}
					step="1"
				/>
			</td>
			<td>
				<input bind:value={national_park.autonomous_community} type="text" />
			</td>
			<td>
				<input bind:value={national_park.initial_area} type="number" min="1" step="1" />
			</td>
			<td>
				<input bind:value={national_park.current_area} type="number" min="1" step="1" />
			</td>
			<td>
				<Button color="primary" on:click={updateNationalPark}>Actualizar</Button>
				<Button color="danger" on:click={() => deleteNationalPark(national_park.national_park)}
					>Eliminar</Button
				>
			</td>
		</tr>
	</tbody>
</Table>

<Button outline color="primary" href="/national-parks"
	>Volver a la lista de Parques Nacionales</Button
>
