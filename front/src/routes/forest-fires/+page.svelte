<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  interface Incendio {
    year: number;
    autonomous_community: string;
    number_of_accidents: number;
    percentage_of_large_fires: number;
  }

  const dev = import.meta.env.DEV;
  const BASE_URL = dev ? 'http://localhost:16078' : 'https://sos2425-13.onrender.com';
  const API = `${BASE_URL}/api/v1/forest-fires`;

  let incendios: Incendio[] = [];
  let mensaje = '';
  let error = '';
  let filtroDesde: string = '';
  let filtroHasta: string = '';
  let filtroComunidad: string = '';

  // Datos del formulario
  let year = '';
  let autonomous_community = '';
  let number_of_accidents = '';
  let percentage_of_large_fires = '';

  const cargarIncendios = async () => {
    try {
      const res = await fetch(API);
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

  const crearIncendio = async () => {
    mensaje = '';
    error = '';

    if (!year || !autonomous_community || !number_of_accidents || !percentage_of_large_fires) {
      error = '⚠️ Todos los campos son obligatorios.';
      return;
    }

    const porcentaje = Number(percentage_of_large_fires);
    if (porcentaje < 0 || porcentaje > 1) {
      error = '⚠️ El porcentaje debe estar entre 0 y 1.';
      return;
    }

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: parseInt(year),
          autonomous_community: autonomous_community.trim().toLowerCase(),
          number_of_accidents: parseInt(number_of_accidents),
          percentage_of_large_fires: parseFloat(percentage_of_large_fires)
        })
      });

      const data = await res.json();

      if (res.status === 201) {
        mensaje = '✅ Recurso creado correctamente.';
        error = '';
        await cargarIncendios();

        // Limpiar formulario
        year = '';
        autonomous_community = '';
        number_of_accidents = '';
        percentage_of_large_fires = '';
      } else if (res.status === 409) {
        error = '❌ Ya existe un incendio registrado con esos datos.';
      } else if (res.status === 400) {
        error = '❌ Por favor, completa todos los campos obligatorios correctamente.';
      } else {
        error = '❌ No se pudo crear el recurso. Inténtalo más tarde.';
      }
    } catch (err) {
      console.error(err);
      error = '❌ Error de conexión con el servidor.';
    }
  };

  const buscar = async () => {
    let query = [];

    if (filtroDesde) query.push(`fromYear=${filtroDesde}`);
    if (filtroHasta) query.push(`toYear=${filtroHasta}`);
    if (filtroComunidad) query.push(`autonomous_community=${filtroComunidad.trim().toLowerCase()}`);

    const url = `${API}${query.length ? '?' + query.join('&') : ''}`;

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
      const res = await fetch(`${API}/${encodeURIComponent(autonomous_community)}/${year}`, {
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
      const res = await fetch(API, { method: 'DELETE' });
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

<p style="color: blue;">🧪 Prueba visual: este texto debe verse</p>

<h2>➕ Añadir nuevo incendio forestal</h2>
<form on:submit|preventDefault={crearIncendio}>
  <input placeholder="Año" type="number" bind:value={year} required />
  <input placeholder="Comunidad Autónoma" type="text" bind:value={autonomous_community} required />
  <input placeholder="Accidentes" type="number" min="0" bind:value={number_of_accidents} required />
  <input placeholder="% Grandes Incendios (0-1)" type="number" step="0.01" min="0" max="1" bind:value={percentage_of_large_fires} required />
  <button type="submit">✅ Crear recurso</button>
</form>

<hr />

<h2>🔎 Buscar incendios</h2>
<form on:submit|preventDefault={buscar}>
  <input placeholder="Desde año" type="number" bind:value={filtroDesde} />
  <input placeholder="Hasta año" type="number" bind:value={filtroHasta} />
  <input placeholder="Comunidad Autónoma" type="text" bind:value={filtroComunidad} />
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
    padding: 0.4rem;
    font-size: 1rem;
    width: 200px;
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
  }

  table {
    width: 100%;
  }
</style>
