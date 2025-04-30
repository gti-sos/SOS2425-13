<script lang="ts">
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { messageStore } from '$lib/stores/messageStore';

  let year: string = '';
  let autonomousCommunity: string = '';
  let amount: string = '';
  let benefitedPopulation: string = '';
  let projectCount: string = '';
  let message: string = '';
  let c: string = 'info';
  let isLoading: boolean = false;
  let datosCargados: boolean = false;

  const API_BASE = dev
    ? 'http://localhost:16078/api/v1/water-supply-improvements'
    : 'https://sos2425-13.onrender.com/api/v1/water-supply-improvements';

  // Función para formatear la comunidad autónoma en mayúsculas y con tildes
  function formatCommunity(input: string): string {
    const map: Record<string, string> = {
      "andalucia": "Andalucía",
      "aragon": "Aragón",
      "asturias": "Asturias",
      "canarias": "Canarias",
      "cantabria": "Cantabria",
      "castilla-la mancha": "Castilla-La Mancha",
      "castilla y leon": "Castilla y León",
      "cataluña": "Cataluña",
      "comunidad valenciana": "Comunidad Valenciana",
      "extremadura": "Extremadura",
      "galicia": "Galicia",
      "la rioja": "La Rioja",
      "madrid": "Madrid",
      "murcia": "Murcia",
      "navarra": "Navarra",
      "pais vasco": "País Vasco"
    };
    const normalized = input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')  // Eliminar acentos
      .replace(/,/g, '') // Eliminar comas
      .replace(/\s+/g, ' ')  // Reemplazar múltiples espacios por uno solo
      .trim();

    return map[normalized] || input.charAt(0).toUpperCase() + input.slice(1);  // Capitalizar si no se encuentra en el mapa
  }

  onMount(async () => {
    document.title = 'Modificar recurso de agua';
    year = $page.params.year;
    autonomousCommunity = $page.params.autonomous_community;
    await cargarDatos();
  });

  async function cargarDatos() {
    try {
      const res = await fetch(
        `${API_BASE}/${year}/${formatCommunity(autonomousCommunity)}`
      );
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
    } catch (err) {
      console.error(err);
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
      const res = await fetch(
        `${API_BASE}/${year}/${encodeURIComponent(autonomousCommunity)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: parseInt(year, 10),
            autonomous_community: autonomousCommunity,
            amount: Number(amount),
            benefited_population: Number(benefitedPopulation),
            project_count: Number(projectCount)
          })
        }
      );
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
      const res = await fetch(
        `${API_BASE}/${year}/${encodeURIComponent(autonomousCommunity)}`,
        { method: 'DELETE' }
      );
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

<style>
  :root {
    --primary: #0056b3;
    --danger: #dc3545;
    --success: #28a745;
    --info: #17a2b8;
    --bg: #f5f5f5;
    --card-bg: #fff;
    --border: #dee2e6;
    --radius: 6px;
    --shadow: rgba(0,0,0,0.08);
    --font: 'Roboto', sans-serif;
  }

  .container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 1.5rem;
    background: var(--card-bg);
    border-radius: var(--radius);
    box-shadow: 0 4px 12px var(--shadow);
    font-family: var(--font);
  }

  h1 {
    color: var(--primary);
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .alert {
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
  }

  .alert-info {
    background: rgba(23,162,184,0.1);
    color: var(--info);
  }

  .alert-success {
    background: rgba(40,167,69,0.1);
    color: var(--success);
  }

  .alert-danger {
    background: rgba(220,53,69,0.1);
    color: var(--danger);
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-sizing: border-box;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    margin-right: 0.5rem;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-info {
    background: var(--info);
    color: #fff;
  }

  .btn-danger {
    background: var(--danger);
    color: #fff;
  }

  .btn-success {
    background: var(--success);
    color: #fff;
  }

  .back-btn {
    background: var(--primary);
    color: #fff;
    margin-top: 1rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }
</style>

<main class="container">
  {#if message}
    <div class="alert alert-{c}">{message}</div>
  {/if}

  {#if datosCargados}
    <h1>Está modificando el recurso con año {year} y CCAA {formatCommunity(autonomousCommunity)}</h1>

    <div class="form-group">
      <label for="amount">Cantidad (€)</label>
      <input id="amount" type="number" step="0.01" bind:value={amount} />
    </div>
    <div class="form-group">
      <label for="benefitedPopulation">Población Beneficiada</label>
      <input id="benefitedPopulation" type="number" bind:value={benefitedPopulation} />
    </div>
    <div class="form-group">
      <label for="projectCount">Proyectos</label>
      <input id="projectCount" type="number" bind:value={projectCount} />
    </div>
    <div class="actions">
      <button class="btn btn-info" on:click={updateData} disabled={isLoading}>
        {isLoading ? 'Actualizando...' : 'Actualizar'}
      </button>
      <button class="btn btn-danger" on:click={deleteData} disabled={isLoading}>
        {isLoading ? 'Eliminando...' : 'Eliminar'}
      </button>
    </div>
  {/if}

  <button class="btn back-btn" on:click={() => goto('/water-supply-improvements')}>Volver</button>
</main>
