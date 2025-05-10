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
    let chartDiv: HTMLDivElement;
    let chartInstance: echarts.ECharts;
  
    // guarda precipitación por CCAA
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
  
    // carga de forma secuencial para no hacer 429
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
      const labels  = benefits.map(b => b.autonomous_community);
      const invData = benefits.map(b => b.amount);
      const precData= labels.map(ccaa => precipMap.get(ccaa) ?? 0);
      const maxInv  = Math.max(...invData) * 1.1;
      const maxPrec = Math.max(...precData) * 1.1;
  
      const option: echarts.EChartsOption = {
        title: { text: `Inversión vs Precipitación (${year})`, left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['Inversión (€)', 'Precipitación (mm)'], bottom: 0 },
        xAxis: [
          {
            type: 'value',
            name: '€',
            position: 'top',
            min: 0,
            max: maxInv,
            axisLabel: { formatter: value => `${value}` }
          },
          {
            type: 'value',
            name: 'mm',
            position: 'bottom',
            min: 0,
            max: maxPrec,
            axisLabel: { formatter: value => `${value}` },
            axisLine: { lineStyle: { color: '#91CC75' } }
          }
        ],
        yAxis: {
          type: 'category',
          data: labels,
          name: 'Comunidades Autónomas',
          inverse: true
        },
        series: [
          {
            name: 'Inversión (€)',
            type: 'bar',
            data: invData,
            xAxisIndex: 0,
            label: { show: true, position: 'right', formatter: '{c}' }
          },
          {
            name: 'Precipitación (mm)',
            type: 'bar',
            data: precData,
            xAxisIndex: 1,
            label: { show: true, position: 'right', formatter: '{c}' }
          }
        ]
      };
  
      if (!chartInstance) {
        chartInstance = echarts.init(chartDiv);
      }
      chartInstance.setOption(option);
    }
  
    async function updateChart() {
      try {
        error = null;
        await fetchSummary();
        await loadAllPrecipitations();
        initChart();
      } catch (e: any) {
        error = e.message;
      }
    }
  
    onMount(updateChart);
  </script>
  
  <main>
    <h2>Inversión vs Precipitación por CC.AA.</h2>
    <div class="controls">
      <label for="year">Año:</label>
      <select id="year" bind:value={year} on:change={updateChart}>
        {#each YEARS as y}<option value={y}>{y}</option>{/each}
      </select>
    </div>
  
    {#if error}
      <p class="error">Error: {error}</p>
    {:else}
      <div bind:this={chartDiv} class="chart"></div>
    {/if}
    <button
		on:click={() => (window.location.href = '/integrations/water-supply-improvements/externas')}
		style="display:block; margin:20px auto; padding:8px 12px; background-color:#8fc177; color:#000; border:none; border-radius:4px; cursor:pointer;"
	>
		Volver
	</button>
  </main>
  
  <style>
    main { max-width:1000px; margin:2rem auto; padding:0 1rem; font-family:sans-serif }
    h2 { text-align:center; margin-bottom:1rem }
    .controls { display:flex; justify-content:center; gap:0.5rem; margin-bottom:1rem }
    .chart { width:100%; height:600px }
    .error { color:red; text-align:center }
  </style>
  