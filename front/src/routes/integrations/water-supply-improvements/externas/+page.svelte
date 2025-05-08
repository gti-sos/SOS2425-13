<script lang="ts">
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';
    import * as echarts from 'echarts';
  
      // URLs relativas para las APIs
    const API_BASE = dev ? 'http://localhost:16078' : 'https://sos2425-13.onrender.com/';  
    const SUMMARY_API = `${API_BASE}/api/v1/water-supply-improvements`;
    const PRECIP_API = `${API_BASE}/api/v1/proxy/precipitation-history`;
  
    interface SummaryData {
      year: string;
      precipitation_litersPerM2: number;
      totalWaterCost: number;
    }
  
    let summary: SummaryData | null = null;
    let precipDays: any[] = [];
    let error: string | null = null;
    let chartDiv: HTMLDivElement;
    let chartInstance: echarts.ECharts;
  
    // Obtiene datos de resumen (precipitación + coste)
    async function fetchSummary() {
      try {
        const resp = await fetch(`${SUMMARY_API}?year=2015`);
        if (!resp.ok) throw new Error(`Error ${resp.status}`);
        summary = await resp.json();
      } catch (e: any) {
        console.error('fetchSummary failed', e);
        error = e.message;
      }
    }
  
    // Obtiene historial de precipitación via proxy
    async function fetchPrecipitation() {
      try {
        const resp = await fetch(`${PRECIP_API}?location=Spain&start=2015-01-01&end=2015-12-31`);
        if (!resp.ok) throw new Error(`Error ${resp.status}`);
        const json = await resp.json();
        precipDays = json.days || [];
      } catch (e: any) {
        console.error('fetchPrecipitation failed', e);
        error = e.message;
      }
    }
  
    // Inicializa gráfico comparativo
    function initChart() {
      if (!summary || precipDays.length === 0) return;
      const option: echarts.EChartsOption = {
        title: { text: 'Precipitación vs Gasto de Agua', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['Litros/m² tot.', 'Gasto (€)'] },
        yAxis: { type: 'value' },
        series: [
          {
            name: 'Valor',
            type: 'bar',
            data: [summary.precipitation_litersPerM2, summary.totalWaterCost]
          }
        ]
      };
      if (!chartInstance) chartInstance = echarts.init(chartDiv);
      chartInstance.setOption(option);
    }
  
    onMount(async () => {
      await Promise.all([fetchSummary(), fetchPrecipitation()]);
      initChart();
    });
  </script>
  
  <svelte:head>
    <title>Resumen Agua 2015</title>
  </svelte:head>
  
  <main>
    <h2 class="text-2xl font-bold mb-4">Resumen Agua 2015</h2>
    {#if error}
      <p class="text-red-600">Error: {error}</p>
    {:else}
      <div bind:this={chartDiv} style="width:100%;height:400px;"></div>
      <button on:click={() => window.history.back()} class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Volver
      </button>
    {/if}
  </main>
  
  <style>
    main { max-width: 800px; margin: 2rem auto; font-family: system-ui; }
    h2 { text-align: center; }
  </style>
  