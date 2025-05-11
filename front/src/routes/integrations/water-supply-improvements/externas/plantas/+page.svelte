<script lang="ts">
  import { onMount } from 'svelte';
  import type { Chart } from 'chart.js';
  import { Chart as ChartJS, registerables } from 'chart.js';

  ChartJS.register(...registerables);

  let chart: Chart | null = null;
  let canvas!: HTMLCanvasElement;

  const PLANT_ID = '63ef4eb7476230641c4c0d62';
  const COMMUNITY = 'madrid';

  let plantCount = 0;
  let projectCount = 0;
  let errorMsg: string | null = null;

  onMount(async () => {
    try {
      // 1) Obtener total de plantas
      const plantRes = await fetch(
        `/api/v1/proxy/plants-count?id=${encodeURIComponent(PLANT_ID)}`
      );
      if (!plantRes.ok) throw new Error(`Plants API: ${plantRes.status}`);
      const { plantCount: pc } = await plantRes.json();
      plantCount = typeof pc === 'number' ? pc : 0;

      // 2) Obtener total de proyectos
      const projRes = await fetch(
        `/api/v1/water-supply-improvements?autonomous_community=${COMMUNITY}`
      );
      if (!projRes.ok) throw new Error(`Projects API: ${projRes.status}`);
      const projJson = await projRes.json();
      projectCount = Array.isArray(projJson)
        ? projJson.reduce((sum, item) => sum + (item.project_count ?? 0), 0)
        : 0;

      // 3) Renderizar PolarArea
      if (chart) chart.destroy();
      chart = new ChartJS(canvas, {
        type: 'polarArea',
        data: {
          labels: ['Plantas', 'Proyectos'],
          datasets: [
            {
              label: 'Cantidad',
              data: [plantCount, projectCount],
              backgroundColor: [
                'rgba(75,192,192,0.6)',
                'rgba(255,159,64,0.6)'
              ],
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label(ctx) {
                  // ctx.parsed.r contiene el valor en PolarArea
                  const value = ctx.parsed.r;
                  return `${ctx.label}: ${value}`;
                }
              }
            }
          },
          scales: {
            r: { beginAtZero: true }
          }
        }
      });
    } catch (e: any) {
      errorMsg = e.message;
      console.error(e);
    }
  });
</script>

<main class="p-4 mx-auto max-w-lg">
  <div class="chart-container">
    <h2 class="text-center text-xl font-semibold mb-4">
      Comparativa Plantas vs Proyectos (Madrid)
    </h2>

    {#if errorMsg}
      <p class="text-red-600 text-center">{errorMsg}</p>
    {:else}
      <div style="width: 500px; height: 500px; margin: 0 auto; position: relative;">
        <canvas bind:this={canvas}></canvas>
        <div class="chart-type">chartjs:polarArea</div>
      </div>
    {/if}
  </div>

  <button
    on:click={() => (window.location.href = '/integrations/water-supply-improvements/externas')}
   style="display:block; margin:20px auto; padding:8px 12px; background-color:#8fc177; color:#000; border:none; border-radius:4px; cursor:pointer;"
  >
    Volver
  </button>
</main>

<style>
  .chart-container {
    background: #fff;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .chart-type {
    position: absolute;
    bottom: 8px;
    right: 12px;
    background: rgba(255, 255, 255, 0.8);
    padding: 2px 6px;
    font-size: 12px;
    border-radius: 4px;
    color: #555;
  }

  main {
    font-family: system-ui, sans-serif;
  }
</style>
