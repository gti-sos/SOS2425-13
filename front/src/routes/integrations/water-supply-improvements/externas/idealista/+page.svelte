<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let svg: SVGSVGElement;
  let totalHomes = 0;
  let totalBeneficiaries = 0;
  let errorMsg: string | null = null;

  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  function renderChart() {
    const data = [
      { label: 'Viviendas en venta', value: totalHomes },
      { label: 'Población beneficiada', value: totalBeneficiaries }
    ];

    // Limpiar SVG antes de renderizar de nuevo
    d3.select(svg).selectAll('*').remove();

    const g = d3.select(svg)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand<string>()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.2);
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: { value: number }) => d.value) ?? 0])
      .nice()
      .range([height, 0]);

    // Eje X con etiquetas rotadas
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-40)')
      .style('text-anchor', 'end');

    // Eje Y
    g.append('g')
      .call(d3.axisLeft(y));

    // Barras
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: { label: string }) => x(d.label)!)
      .attr('y', (d: { value: number }) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d: { value: number }) => height - y(d.value));
  }

  onMount(async () => {
    try {
      // Fetch total de viviendas en Madrid
      const homesRes = await fetch(`/api/v1/proxy/idealista-madrid-homes`);
      if (!homesRes.ok) throw new Error(`Homes API: ${homesRes.status} ${homesRes.statusText}`);
      const homesJson = await homesRes.json();
      totalHomes = homesJson.totalResults ?? homesJson.total ?? 0;

      // Datos iniciales local para 2015
      const datosInicialesB = [
        { year: 2015, autonomous_community: "madrid", benefited_population: 4164 },
        // ...otros datos omitidos
      ];
      // Obtener población beneficiada para Madrid en 2015
      const madrid2015 = datosInicialesB.find(d => d.year === 2015 && d.autonomous_community === 'madrid');
      totalBeneficiaries = madrid2015 ? madrid2015.benefited_population : 0;

      renderChart();
    } catch (err: any) {
      errorMsg = err.message;
      console.error(err);
    }
  });
</script>

<main class="p-4">
  <h1 class="text-2xl font-bold mb-4">Estadísticas de Madrid</h1>

  {#if errorMsg}
    <p class="text-red-600">Error: {errorMsg}</p>
  {:else}
    <div class="mb-4">
      <p><strong>Total de viviendas:</strong> {totalHomes}</p>
      <p><strong>Población beneficiada:</strong> {totalBeneficiaries}</p>
    </div>
    <svg bind:this={svg}></svg>
  {/if}
</main>

<style>
  .bar {
    fill: steelblue;
  }
</style>
