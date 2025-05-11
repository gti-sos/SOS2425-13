<script lang="ts">
  import { onMount } from 'svelte';
  import * as echarts from 'echarts';

  const SUMMARY_API  = '/api/v1/water-supply-improvements';
  const PRECIP_PROXY = '/api/v1/proxy/precipitation-history';
  const YEARS        = [2015, 2016, 2017];

  interface SummaryRec {
    year: number;
    autonomous_community: string;
    amount: number;      // inversión
  }

  let year = YEARS[0];
  let benefits: SummaryRec[] = [];
  let error: string | null = null;
  let chartDiv!: HTMLDivElement;
  let chartInstance!: echarts.ECharts;

  const precipMap = new Map<string, number>();

  async function fetchSummary() {
    const resp = await fetch(`${SUMMARY_API}?year=${year}`);
    if (!resp.ok) throw new Error(`Error summary ${resp.status}`);
    benefits = await resp.json() as SummaryRec[];
  }

  async function fetchPrecipitationFor(ccaa: string): Promise<number> {
    const start = `${year}-01-01`;
    const end   = `${year}-12-31`;
    const resp = await fetch(
      `${PRECIP_PROXY}?location=${encodeURIComponent(ccaa)}&start=${start}&end=${end}`
    );
    if (!resp.ok) throw new Error(`Precip ${ccaa}: ${resp.status}`);
    const { days } = await resp.json() as { days: { precipitation: number }[] };
    return days.reduce((sum, d) => sum + (d.precipitation || 0), 0);
  }

  async function loadAllPrecipitations() {
    precipMap.clear();
    for (const b of benefits) {
      try {
        const total = await fetchPrecipitationFor(b.autonomous_community);
        precipMap.set(b.autonomous_community, total);
      } catch {
        precipMap.set(b.autonomous_community, 0);
      }
      await new Promise(r => setTimeout(r, 300));
    }
  }

  function initChart() {
    const labels   = benefits.map(b => b.autonomous_community);
    const invData  = benefits.map(b => b.amount);
    const precData = labels.map(ccaa => precipMap.get(ccaa) ?? 0);
    const maxVal   = Math.max(...invData, ...precData) * 1.1;

    const option: echarts.EChartsOption = {
      title: { text: `Inversión vs Precipitación (${year})`, left: 'center' },
      tooltip: { trigger: 'item' },
      legend: {
        data: ['Inversión (€)', 'Precipitación (mm)'],
        bottom: 0
      },
      radar: {
        indicator: labels.map(name => ({ name, max: maxVal })),
        radius: '60%'
      },
      series: [{
        name: 'Comparativa anual',
        type: 'radar',
        data: [
          { value: invData, name: 'Inversión (€)', lineStyle: { width: 1 }, areaStyle: { opacity: 0.2 } },
          { value: precData, name: 'Precipitación (mm)', lineStyle: { width: 3, color: '#5470C6' }, areaStyle: { opacity: 0.5, color: '#91CC75' } }
        ],
        emphasis: { lineStyle: { width: 3 } }
      }]
    };

    if (!chartInstance) {
      chartInstance = echarts.init(chartDiv);
    }
    chartInstance.setOption(option);
  }

  async function updateChart() {
    error = null;
    try {
      await fetchSummary();
      await loadAllPrecipitations();
      initChart();
    } catch (e: any) {
      error = e.message;
    }
  }

  onMount(updateChart);
</script>

<main class="p-4 mx-auto max-w-3xl">
  <div class="chart-container">
    <h2 class="text-center text-2xl font-semibold mb-4">Inversión vs Precipitación por CC.AA.</h2>
    <div class="controls mb-4">
      <label for="year">Año:</label>
      <select id="year" bind:value={year} on:change={updateChart} class="ml-2">
        {#each YEARS as y}
          <option value={y}>{y}</option>
        {/each}
      </select>
    </div>

    {#if error}
      <p class="text-red-600 text-center mb-6">{error}</p>
    {:else}
      <div bind:this={chartDiv} class="chart"></div>
      <div class="chart-type">echarts:radar</div>
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
  .controls {
    display: flex;
    justify-content: center;
  }
  .chart {
    width: 100%;
    height: 600px;
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
