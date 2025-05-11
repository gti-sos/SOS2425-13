<script lang="ts">
  import { onMount } from 'svelte';
  import Highcharts from 'highcharts';

  let container: HTMLDivElement;
  let totalHomes = 0;
  let totalBeneficiaries = 0;
  let errorMsg: string | null = null;
  let chart: Highcharts.Chart | null = null;

  async function fetchData() {
    const homesRes = await fetch(`/api/v1/proxy/idealista-madrid-homes`);
    if (!homesRes.ok) throw new Error(`Homes API: ${homesRes.status}`);
    const homesJson = await homesRes.json();
    totalHomes = homesJson.totalResults ?? homesJson.total ?? 0;

    const datosInicialesB = [
      { year: 2015, autonomous_community: "madrid", benefited_population: 4164 },
      // ...otros datos omitidos
    ];
    const madrid2015 = datosInicialesB.find(d => d.year === 2015 && d.autonomous_community === 'madrid');
    totalBeneficiaries = madrid2015 ? madrid2015.benefited_population : 0;
  }

  function renderChart() {
    if (chart) chart.destroy();

    chart = Highcharts.chart(container, {
      chart: { type: 'column' },
      title: { text: 'Estadísticas de Madrid' },
      xAxis: {
        categories: ['Viviendas en venta', 'Población beneficiada'],
        crosshair: true
      },
      yAxis: {
        min: 0,
        title: { text: 'Total' }
      },
      series: [{
        name: 'Recursos',
        type: 'column',
        data: [totalHomes, totalBeneficiaries],
        colorByPoint: true
      }],
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><br/>',
        pointFormat: '<b>{point.y}</b>'
      },
      credits: { enabled: false },
      exporting: { enabled: false }
    });
  }

  onMount(async () => {
    try {
      await fetchData();
      renderChart();
    } catch (e: any) {
      errorMsg = e.message;
    }
  });
</script>

<main class="p-4 mx-auto" style="max-width: 600px;">
  <div class="chart-container">
    <h2 class="text-center text-xl font-semibold mb-4">Estadísticas de Madrid</h2>

    {#if errorMsg}
      <p class="text-red-600 text-center">{errorMsg}</p>
    {:else}
      <p class="mb-2"><strong>Total viviendas:</strong> {totalHomes}</p>
      <p class="mb-4"><strong>Población beneficiada:</strong> {totalBeneficiaries}</p>
      <div bind:this={container} class="chart" style="height: 300px;"></div>
      <div class="chart-type">highcharts:column</div>
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
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    position: relative;
  }
  .chart {
    width: 100%;
  }
  .chart-type {
    position: absolute;
    bottom: 8px;
    right: 12px;
    background: rgba(255,255,255,0.8);
    padding: 2px 6px;
    font-size: 12px;
    border-radius: 4px;
    color: #555;
  }
  main {
    font-family: system-ui, sans-serif;
  }
</style>
