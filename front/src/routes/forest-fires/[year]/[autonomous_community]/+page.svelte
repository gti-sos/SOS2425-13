<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
  
    let year, comunidad;
    let number_of_accidents = '';
    let percentage_of_large_fires = '';
    let mensaje = '';
    let error = '';
  
    // Obtener los parámetros de la ruta
    $: ({ year, comunidad } = $page.params);
  
    // Cargar datos del recurso a editar
    const cargarDato = async () => {
      try {
        const res = await fetch(`/api/v1/forest-fires/${year}/${encodeURIComponent(comunidad)}`);
        const data = await res.json();
  
        if (res.ok) {
          number_of_accidents = data.number_of_accidents;
          percentage_of_large_fires = data.percentage_of_large_fires;
        } else {
          error = data.message || '❌ No se pudo encontrar el recurso.';
        }
      } catch (e) {
        error = '❌ Error al conectar con el servidor.';
      }
    };
  
    // Guardar los cambios
    const guardarCambios = async () => {
      try {
        const res = await fetch(`/api/v1/forest-fires/${year}/${encodeURIComponent(comunidad)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: parseInt(year),
            autonomous_community: comunidad,
            number_of_accidents: parseInt(number_of_accidents),
            percentage_of_large_fires: parseFloat(percentage_of_large_fires)
          })
        });
  
        const data = await res.json();
  
        if (res.ok) {
          mensaje = '✅ Cambios guardados correctamente.';
          setTimeout(() => goto('/forest-fires'), 1000); // Redirección mejor a lista
        } else if (res.status === 409) {
          error = '❌ No se puede cambiar el año o la comunidad. Son datos únicos.';
        } else if (res.status === 404) {
          error = `❌ No existe un incendio registrado para "${comunidad}" en ${year}.`;
        } else if (res.status === 400) {
          error = '❌ Faltan campos o hay datos inválidos.';
        } else {
          error = '❌ Error desconocido al guardar los cambios.';
        }
      } catch (e) {
        error = '❌ Error al conectar con el servidor.';
      }
    };
  
    onMount(cargarDato);
  </script>
  
  <h1>✏️ Editar incendio: {comunidad} - {year}</h1>
  
  {#if mensaje}
    <div style="color: green;">{mensaje}</div>
  {/if}
  
  {#if error}
    <div style="color: red;">{error}</div>
  {/if}
  
  <form on:submit|preventDefault={guardarCambios}>
    <label for="accidentes">Número de accidentes forestales:</label>
    <input
      id="accidentes"
      type="number"
      bind:value={number_of_accidents}
      required
      min="0"
    />
  
    <label for="porcentaje">Porcentaje de grandes incendios (0 a 1):</label>
    <input
      id="porcentaje"
      type="number"
      step="0.01"
      min="0"
      max="1"
      bind:value={percentage_of_large_fires}
      required
    />
  
    <div style="margin-top: 1rem;">
      <button type="submit">💾 Guardar cambios</button>
      <button type="button" on:click={() => goto('/forest-fires')}>❌ Cancelar</button>
    </div>
  </form>
  
  <style>
    form {
      display: flex;
      flex-direction: column;
      max-width: 400px;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  
    input {
      padding: 0.4rem;
      font-size: 1rem;
    }
  
    button {
      padding: 0.5rem;
      font-size: 1rem;
      margin-right: 0.5rem;
    }
  
    h1 {
      margin-top: 1rem;
    }
  </style>