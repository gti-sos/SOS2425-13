<script lang="ts">
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { messageStore } from '$lib/stores/messageStore';

  let year = '';
  let autonomousCommunity = '';
  let amount = '';
  let benefitedPopulation = '';
  let projectCount = '';
  let message = '';
  let c: string = 'info';
  let isLoading = false;
  let datosCargados = false;

  const API_BASE = dev
    ? 'http://localhost:16078/api/v1/water-supply-improvements'
    : 'https://sos2425-13.onrender.com/api/v1/water-supply-improvements';

  onMount(async () => {
    document.title = `Modificar ${year} – ${autonomousCommunity}`;

    year = $page.params.year;
    autonomousCommunity = $page.params.autonomous_community;
    await cargarDatos();
  });

  async function cargarDatos() {
  try {
    const res = await fetch(`${API_BASE}/${year}/${encodeURIComponent(autonomousCommunity)}`);
    if (!res.ok) {
      message = `No existe dato para ${year} - ${autonomousCommunity}`;
      c = 'danger';
      datosCargados = false;
      return;
    }
    const data = await res.json();
    amount = data.amount;
    benefitedPopulation = data.benefited_population;
    projectCount = data.project_count;
    datosCargados = true;
    message = '';
    document.title = `Modificar ${year} – ${autonomousCommunity}`; // 👈 AQUI
  } catch {
    message = 'Error de conexión al cargar los datos.';
    c = 'danger';
    datosCargados = false;
  }
}


  async function updateData() {
    isLoading = true;
    message = '';
    c = '';

    try {
      const res = await fetch(`${API_BASE}/${year}/${encodeURIComponent(autonomousCommunity)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: parseInt(year),
          autonomous_community: autonomousCommunity,
          amount: Number(amount),
          benefited_population: Number(benefitedPopulation),
          project_count: Number(projectCount)
        })
      });
      if (res.ok) {
        messageStore.set({ message: 'Recurso actualizado ✅', type: 'success' });
        await goto('/water-supply-improvements');
      } else {
        const errData = await res.json();
        message = errData.error || `Error ${res.status}`;
        c = 'danger';
      }
    } catch {
      message = 'Error inesperado al conectar con la API.';
      c = 'danger';
    } finally {
      isLoading = false;
    }
  }

  async function deleteData() {
    isLoading = true;
    try {
      const res = await fetch(`${API_BASE}/${year}/${encodeURIComponent(autonomousCommunity)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        messageStore.set({ message: 'Recurso eliminado ✅', type: 'success' });
        await goto('/water-supply-improvements');
      } else {
        const errData = await res.json();
        message = errData.error || 'No se pudo eliminar.';
        c = 'danger';
      }
    } catch {
      message = 'Error al eliminar recurso.';
      c = 'danger';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Modificar Recurso</title>
</svelte:head>

<main class="container">
  {#if message}
    <div class="alert alert-{c}">{message}</div>
  {/if}

  {#if datosCargados}
  <h1>Modificar {year} – {autonomousCommunity}</h1>


    <div class="form-group">
      <label for="amount">💧 Cantidad (€)</label>
      <input id="amount" type="number" step="0.01" bind:value={amount} />
    </div>

    <div class="form-group">
      <label for="benefitedPopulation">👥 Población beneficiada</label>
      <input id="benefitedPopulation" type="number" bind:value={benefitedPopulation} />
    </div>

    <div class="form-group">
      <label for="projectCount">📊 Número de proyectos</label>
      <input id="projectCount" type="number" bind:value={projectCount} />
    </div>

    <div class="actions">
      <button class="btn btn-success" on:click={updateData} disabled={isLoading}>
        {isLoading ? 'Actualizando...' : 'Actualizar'}
      </button>
      <button class="btn btn-danger" on:click={deleteData} disabled={isLoading}>
        {isLoading ? 'Eliminando...' : 'Eliminar'}
      </button>
    </div>
  {/if}

  <button class="btn btn-outline back-btn" on:click={() => goto('/water-supply-improvements')}>
    ⬅ Volver
  </button>
</main>

<style>
  :root {
    --primary: #0d47a1;
    --danger: #dc3545;
    --success: #28a745;
    --info: #17a2b8;
    --bg: #f9f9fb;
    --card-bg: #ffffff;
    --border: #ccc;
    --radius: 10px;
    --shadow: rgba(0, 0, 0, 0.08);
    --font: 'Segoe UI', sans-serif;
  }

  .container {
    max-width: 700px;
    margin: 2rem auto;
    background: var(--card-bg);
    padding: 2rem;
    border-radius: var(--radius);
    box-shadow: 0 4px 12px var(--shadow);
    font-family: var(--font);
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: var(--primary);
    text-align: center;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #333;
  }

  input {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-sizing: border-box;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1.25rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: var(--radius);
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .btn-success {
    background-color: var(--success);
    color: #fff;
  }

  .btn-danger {
    background-color: var(--danger);
    color: #fff;
  }

  .btn-outline {
    background: transparent;
    border: 1px solid var(--primary);
    color: var(--primary);
  }

  .btn-outline:hover {
    background: var(--primary);
    color: white;
  }

  .back-btn {
    display: block;
    margin: 2rem auto 0;
    text-align: center;
  }

  .alert {
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    margin-bottom: 1.25rem;
    font-weight: 500;
  }

  .alert-info {
    background: rgba(23, 162, 184, 0.1);
    color: var(--info);
  }

  .alert-danger {
    background: rgba(220, 53, 69, 0.1);
    color: var(--danger);
  }

  .alert-success {
    background: rgba(40, 167, 69, 0.1);
    color: var(--success);
  }

  @media (max-width: 600px) {
    .actions {
      flex-direction: column;
      align-items: stretch;
    }

    .btn {
      width: 100%;
    }
  }
</style>
