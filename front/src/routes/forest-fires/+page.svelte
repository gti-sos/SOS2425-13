<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
  
    // Interfaz en singular
    interface Incendio {
      year: number;
      autonomous_community: string;
      number_of_accidents: number;
      percentage_of_large_fires: number;
    }
  
    // Tipado explícito
    let incendios: Incendio[] = [];
    let mensaje = '';
    let error = '';
    let filtroDesde: string = '';
    let filtroHasta: string = '';
    let filtroComunidad: string = '';
  
    // Cargar todos los datos al iniciar
    const cargarIncendios = async () => {
      try {
        const res = await fetch('/api/v1/forest-fires');
        if (!res.ok) throw new Error('Error cargando datos');
        incendios = await res.json();
        mensaje = '';
        error = '';
      } catch (err) {
        error = '❌ No se pudieron cargar los datos de incendios forestales.';
        mensaje = '';
        console.error(err);
      }
    };
  
    const buscar = async () => {
      let query = [];
  
      if (filtroDesde) query.push(`fromYear=${filtroDesde}`);
      if (filtroHasta) query.push(`toYear=${filtroHasta}`);
      if (filtroComunidad) query.push(`autonomous_community=${filtroComunidad.trim().toLowerCase()}`);
  
      const url = `/api/v1/forest-fires${query.length ? '?' + query.join('&') : ''}`;
  
      try {
        const res = await fetch(url);
        const data: Incendio[] = await res.json();
  
        if (res.ok) {
          incendios = data;
          mensaje = `🔍 Se encontraron ${data.length} resultado(s).`;
          error = '';
        } else {
          incendios = [];
          mensaje = '';
          error = (data as any).message || '❌ No se encontraron resultados.';
        }
      } catch (err) {
        error = '❌ Error al buscar datos.';
        mensaje = '';
      }
    };
  
    const limpiarFiltros = async () => {
      filtroDesde = '';
      filtroHasta = '';
      filtroComunidad = '';
      await cargarIncendios();
    };
  
    const borrarIncendio = async (year: number, autonomous_community: string) => {
      if (!confirm(`¿Seguro que deseas eliminar el registro de "${autonomous_community}" en ${year}?`)) return;
      try {
        const res = await fetch(`/api/v1/forest-fires/${encodeURIComponent(autonomous_community)}/${year}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (res.ok) {
          mensaje = `✅ ${data.message}`;
          error = '';
          await cargarIncendios();
        } else {
          error = data.message || '❌ Error al eliminar el dato.';
          mensaje = '';
        }
      } catch (err) {
        error = '❌ Error inesperado al eliminar el dato.';
        mensaje = '';
      }
    };
  
    const borrarTodos = async () => {
      if (!confirm("⚠️ ¿Estás seguro de que deseas eliminar TODOS los registros?")) return;
      try {
        const res = await fetch('/api/v1/forest-fires', { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          mensaje = `✅ ${data.message}`;
          error = '';
          await cargarIncendios();
        } else {
          error = data.message || '❌ Error al eliminar todos los datos.';
          mensaje = '';
        }
      } catch (err) {
        error = '❌ Error inesperado al eliminar todos los datos.';
        mensaje = '';
      }
    };
  
    const editar = (year: number, autonomous_community: string) => {
      goto(`/${year}/${encodeURIComponent(autonomous_community)}`);
    };
  
    onMount(cargarIncendios);
  </script>
  
  <h1>🔥 Gestión de Incendios Forestales</h1>
  
  {#if mensaje}
    <div style="color: green;">{mensaje}</div>
  {/if}
  {#if error}
    <div style="color: red;">{error}</div>
  {/if}
  
  <h2>🔎 Buscar incendios</h2>
  <form on:submit|preventDefault={buscar}>
    <label for="desde">Desde el año:</label>
    <input id="desde" type="number" bind:value={filtroDesde} />
  
    <label for="hasta">Hasta el año:</label>
    <input id="hasta" type="number" bind:value={filtroHasta} />
  
    <label for="comunidad">Comunidad Autónoma:</label>
    <input id="comunidad" type="text" bind:value={filtroComunidad} />
  
    <button type="submit">Buscar</button>
    <button type="button" on:click={limpiarFiltros}>Limpiar</button>
  </form>
  
  <button on:click={borrarTodos} style="margin-bottom: 1rem; background-color: red; color: white;">
    🗑️ Eliminar todos los registros
  </button>
  
  {#if incendios.length === 0}
    <p>No hay datos disponibles.</p>
  {:else}
    <table border="1" cellpadding="8">
      <caption>Lista de incendios forestales</caption>
      <thead>
        <tr>
          <th>Año</th>
          <th>Comunidad Autónoma</th>
          <th>Accidentes</th>
          <th>% Grandes Incendios</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each incendios as i}
          <tr>
            <td>{i.year}</td>
            <td>{i.autonomous_community}</td>
            <td>{i.number_of_accidents}</td>
            <td>{(Number(i.percentage_of_large_fires) * 100).toFixed(1)}%</td>
            <td>
              <button on:click={() => editar(i.year, i.autonomous_community)}>✏️ Editar</button>
              <button on:click={() => borrarIncendio(i.year, i.autonomous_community)}>🗑️ Eliminar</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
  
  <style>
    form {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
      align-items: center;
    }
  
    form input {
      width: 150px;
      padding: 0.3rem;
    }
  
    button {
      padding: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
    }
  </style>
  