<script lang="ts">
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';
    import * as echarts from 'echarts';
  
    const API_BASE = dev ? 'http://localhost:16078' : 'https://sos2425-13.onrender.com';
    const SUMMARY_API = `${API_BASE}/api/v1/water-supply-improvements`;
    const PRECIP_API   = `${API_BASE}/api/v1/proxy/precipitation-history`;
  
    interface SummaryData { year: number; totalWaterCost: number; }
  
    let summary: SummaryData | null = null;
    let precipDays: any[] = [];
    let error: string | null = null;
    let chartDiv: HTMLDivElement;
    let chartInstance: echarts.ECharts;
  
    async function fetchSummary() {
      try {
        const resp = await fetch(`${SUMMARY_API}?year=2015`);
        if (!resp.ok) throw new Error(`Error ${resp.status}`);
        const data = await resp.json() as Array<{ amount: number }>;
        const totalWaterCost = data.reduce((sum, rec) => sum + rec.amount, 0);
        summary = { year: 2015, totalWaterCost };
      } catch (e: any) {
        error = e.message;
      }
    }
  
    async function fetchPrecipitation() {
      try {
        const resp = await fetch(`${PRECIP_API}?location=Spain&start=2015-01-01&end=2015-12-31`);
        if (!resp.ok) throw new Error(`Error ${resp.status}`);
        const json = await resp.json();
        precipDays = json.days || [];
      } catch (e: any) {
        error = e.message;
      }
    }
  
    function initChart() {
  if (!summary || precipDays.length === 0) return;

  const totalPrecip = precipDays.reduce((acc, d) => acc + (d.precipitation || 0), 0);

  const option: echarts.EChartsOption = {
    title: {
      text: 'Precipitación vs Gasto de Agua',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Precipitación (mm)', 'Gasto (€)'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: ['Litros/m² tot.', 'Gasto (€)']
    },
    yAxis: [
      {
        type: 'value',
        name: 'mm (L/m²)',
        position: 'left'
      },
      {
        type: 'value',
        name: '€',
        position: 'right'
      }
    ],
    series: [
      {
        name: 'Precipitación (mm)',
        type: 'bar',
        data: [totalPrecip, null],     // solo primer categoría
        yAxisIndex: 0,
        label: { show: true, position: 'top', formatter: '{c}' }
      },
      {
        name: 'Gasto (€)',
        type: 'bar',
        data: [null, summary.totalWaterCost], // solo segunda categoría
        yAxisIndex: 1,
        label: { show: true, position: 'top', formatter: '{c}' }
      }
    ]
  };

  if (!chartInstance) {
    chartInstance = echarts.init(chartDiv);
  }
  chartInstance.setOption(option);
}

  
    onMount(async () => {
      await Promise.all([fetchSummary(), fetchPrecipitation()]);
      initChart();
    });
  </script>
  
  <main>
    <h2>Resumen Agua 2015</h2>
    {#if error}
      <p>Error: {error}</p>
    {:else}
      <div bind:this={chartDiv} style="width:100%;height:400px;"></div>
      <button
		on:click={() => (window.location.href = '/graficos/water-supply-improvements')}
		style="display:block; margin:20px auto; padding:8px 12px; background-color:#8fc177; color:#000; border:none; border-radius:4px; cursor:pointer;"
	>
		Volver
	</button>
    {/if}
  </main>
  