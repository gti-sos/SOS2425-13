<script lang="ts">
    import { onMount } from 'svelte';
    import type { Chart } from 'chart.js';
    import { Chart as ChartJS, registerables } from 'chart.js';
  
    ChartJS.register(...registerables);
  
    let chart: Chart | null = null;
    let canvas!: HTMLCanvasElement;
  
    // Base URL del backend

  
    // Parámetros fijos
    const PLANT_ID = '63ef4eb7476230641c4c0d62';
    const COMMUNITY = 'madrid';
  
    let plantCount = 0;
    let projectCount = 0;
    let errorMsg: string | null = null;
  
    onMount(async () => {
      try {
        // 1) Fetch total de plantas
        const plantUrl = `/api/v1/proxy/plants-count?id=${encodeURIComponent(PLANT_ID)}`;
        const plantRes = await fetch(plantUrl);
        if (!plantRes.ok) throw new Error(`Plants API: ${plantRes.status} ${plantRes.statusText}`);
        const { plantCount: pc } = await plantRes.json();
        plantCount = typeof pc === 'number' ? pc : 0;
  
        // 2) Fetch proyectos de agua en la comunidad
        const projUrl = `/api/v1/water-supply-improvements?autonomous_community=${COMMUNITY}`;
        const projRes = await fetch(projUrl);
        if (!projRes.ok) throw new Error(`Projects API: ${projRes.status} ${projRes.statusText}`);
        const projJson = await projRes.json();
        projectCount = Array.isArray(projJson)
          ? projJson.reduce((sum, item) => sum + (item.project_count ?? 0), 0)
          : 0;
  
        // 3) Renderizar gráfico
        if (chart) chart.destroy();
        chart = new ChartJS(canvas, {
          type: 'bar',
          data: {
            labels: ['Plantas', 'Proyectos'],
            datasets: [{ label: 'Cantidad', data: [plantCount, projectCount] }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Cantidad' } }
            }
          }
        });
      } catch (err) {
        errorMsg = (err as Error).message;
        console.error(err);
      }
    });
  </script>
  
  <main class="p-4">
    <h1 class="text-2xl font-bold mb-4">Comparativa Plantas vs Proyectos (Madrid)</h1>
    {#if errorMsg}
      <p class="text-red-600">Error: {errorMsg}</p>
    {:else}
      <div class="mb-4">
        <p><strong>Total de plantas:</strong> {plantCount}</p>
        <p><strong>Total de proyectos:</strong> {projectCount}</p>
      </div>
      <canvas bind:this={canvas}></canvas>
    {/if}
    <button
		on:click={() => (window.location.href = '/integrations/water-supply-improvements/externas')}
		style="display:block; margin:20px auto; padding:8px 12px; background-color:#8fc177; color:#000; border:none; border-radius:4px; cursor:pointer;"
	>
		Volver
	</button>
  </main>