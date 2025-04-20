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

    let API = '/api/v2/national-parks'; // Fixed the API endpoint
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
    
    // Estados adicionales para mejorar la UX
    let isLoading = true;
    let notFound = false;
    let errorMessage = '';

    // Función para mostrar mensajes
    function mostrarMensaje(texto, tipo = "info") {
      mensaje = texto;
      tipoMensaje = tipo;
      setTimeout(() => mensaje = "", 5000);
    }

    // Obtener los datos de un parque nacional específico con mejor manejo de errores
    async function getNationalPark() {
        isLoading = true;
        notFound = false;
        errorMessage = '';
        resultStatus = result = '';
        
        try {
            const res = await fetch(`${API}/${parkName}`, { method: 'GET' });
            
            if (res.ok) {
                const data = await res.json();
                result = JSON.stringify(data, null, 2);
                national_park = data;
                console.log(`Response received: \n${JSON.stringify(national_park, null, 2)}`);
            } else if (res.status === 404) {
                console.log(`Parque nacional '${parkName}' no encontrado`);
                notFound = true;
                errorMessage = `No existe un parque nacional con el nombre '${parkName}'.`;
                mostrarMensaje(errorMessage, 'warning');
                
                // Programar redirección automática después de 5 segundos
                setTimeout(() => {
                    goto('/national-parks');
                }, 8000);
            } else {
                console.log(`Error al obtener el parque '${parkName}': ${res.status}`);
                errorMessage = `Se produjo un error al cargar los datos del parque. Código: ${res.status}`;
                mostrarMensaje(errorMessage, 'error');
            }
        } catch (error) {
            console.log(`ERROR getting data from ${API}: ${error}`);
            errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
            mostrarMensaje(errorMessage, 'error');
        } finally {
            isLoading = false;
        }
    }

	//Actualizar un parque nacional
	async function updateNationalPark() {
    mensaje = '';
    // Construir el objeto solo con los campos editables
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
            // Esperar a que el usuario vea el mensaje antes de redirigir
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
    // Reactive declaration for the page title
    $: pageTitle = isLoading 
        ? 'Cargando parque... | Parques Nacionales' 
        : notFound 
            ? 'Parque no encontrado | Parques Nacionales' 
            : `${national_park.national_park || 'Detalles del parque'} | Parques Nacionales`;
</script>

<!-- Título dinámico que cambia según el estado -->

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

<h2 style="text-align: center; margin-top: 1rem; margin-bottom: 1rem;">
    {#if isLoading}
        Cargando información del parque...
    {:else if notFound}
        Parque nacional no encontrado
    {:else}
        Detalles del Parque Nacional: {national_park.national_park}
    {/if}
</h2>

<!-- Añadir este bloque para mostrar mensajes -->
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

<!-- Contenido condicional según el estado -->
{#if isLoading}
    <div class="text-center p-5">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3">Cargando información del parque...</p>
    </div>
{:else if notFound}
    <div class="text-center p-5">
        <Alert color="warning" className="text-center">
            <h4 class="alert-heading">Parque no encontrado</h4>
            <p>{errorMessage}</p>
            <hr />
            <p class="mb-0">Serás redirigido a la lista de parques en 8 segundos...</p>
        </Alert>
        
        <div class="mt-4">
            <Button color="primary" on:click={() => goto('/national-parks')}>
                <span class="glyphicon glyphicon-arrow-left"></span> Volver a la lista de parques
            </Button>
        </div>
    </div>
{:else}
    <!-- Contenido original de la tabla -->
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
{/if}