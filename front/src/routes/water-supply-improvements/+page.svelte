<script lang="ts">
    import { onMount } from "svelte";
    import { dev } from "$app/environment";
    import { goto } from "$app/navigation";
    import "bootstrap/dist/css/bootstrap.min.css";
  
    interface Datos {
      year: number;
      autonomous_community: string;
      amount: number;
      benefited_population: number;
      project_count: number;
    }
  
    let Datos: Datos[] = [];
    let mensaje = "";
    let tipoMensaje = "primary";
    let limit = 10;
    let offset = 0;
    const BASE_URL = dev
  ? "http://localhost:16078"
  : "https://sos2425-13.onrender.com"; // ← Aquí va tu URL de Render

    const API = `${BASE_URL}/api/v1/front-water-supply-improvements`;

    let query = `?limit=${limit}&offset=${offset}`;
  
    // Formulario de creación
    let year = "";
    let comunidad = "";
    let cantidad = "";
    let poblacion = "";
    let proyectos = "";
  
    // Búsqueda
    let busquedaYear = "";
    let busquedaComunidad = "";
    let busquedaCantidad = "";
    let busquedaPoblacion = "";
    let busquedaProyectos = "";
    let desde = "";
    let hasta = "";
  
    // Modo de edición
    let editMode = false;
    let currentEdit: Datos | null = null;
  
    onMount(() => {
      obtenerDatos();
    });
  
    async function obtenerDatos() {
      try {
        const res = await fetch(API + query);
        if (!res.ok) throw new Error();
        Datos = await res.json();
      } catch {
        mensaje = "No existen datos, cargue los iniciales";
        tipoMensaje = "danger";
      }
    }
  
    function mostrarMensaje(texto: string, tipo: string = "info") {
      mensaje = texto;
      tipoMensaje = tipo;
      setTimeout(() => mensaje = "", 4000);
    }
  
    async function cargarIniciales() {
      try {
        const res = await fetch(API + "/loadInitialData");
        if (!res.ok) throw new Error();
        mostrarMensaje("Datos iniciales cargados correctamente", "success");
        obtenerDatos();
      } catch {
        mostrarMensaje("Ya existen datos.", "danger");
      }
    }
  
    async function crear() {
      try {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: parseInt(year),
            autonomous_community: comunidad,
            amount: parseFloat(cantidad),
            benefited_population: parseInt(poblacion),
            project_count: parseInt(proyectos),
          }),
        });
  
        if (res.status === 201) {
          mostrarMensaje("Recurso creado correctamente", "success");
          limpiarFormulario();
          obtenerDatos();
        } else if (res.status === 409) {
          mostrarMensaje("Ya existe un recurso con ese año y comunidad", "warning");
        } else if (res.status === 400) {
          mostrarMensaje("Por favor, completa todos los campos correctamente.", "warning");
        } else {
          throw new Error();
        }
      } catch {
        mostrarMensaje("Error al crear el recurso.", "danger");
      }
    }
  
    function limpiarFormulario() {
      year = comunidad = cantidad = poblacion = proyectos = "";
    }
  
    async function eliminarTodo() {
      try {
        const res = await fetch(API, { method: "DELETE" });
        if (!res.ok) throw new Error();
        Datos = [];
        mostrarMensaje("Todos los datos fueron eliminados", "success");
      } catch {
        mostrarMensaje("No se pudieron eliminar los datos.", "danger");
      }
    }
  
    async function buscarIntervalo() {
      try {
        const res = await fetch(`${API}?from=${desde}&to=${hasta}`);
        if (!res.ok) throw new Error();
        Datos = await res.json();
        mostrarMensaje("Resultados del intervalo obtenidos", "info");
      } catch {
        mostrarMensaje("No se encontraron resultados para ese intervalo", "warning");
      }
    }
  
    async function buscar() {
      let filtros = [];
      if (busquedaYear) filtros.push(`year=${busquedaYear}`);
      if (busquedaComunidad) filtros.push(`autonomous_community=${busquedaComunidad}`);
      if (busquedaCantidad) filtros.push(`amount=${busquedaCantidad}`);
      if (busquedaPoblacion) filtros.push(`benefited_population=${busquedaPoblacion}`);
      if (busquedaProyectos) filtros.push(`project_count=${busquedaProyectos}`);
  
      query = `?limit=${limit}&offset=0${filtros.length ? "&" + filtros.join("&") : ""}`;
      offset = 0;
      obtenerDatos();
    }
  
    function siguientePagina() {
      offset += limit;
      query = `?limit=${limit}&offset=${offset}`;
      obtenerDatos();
    }
  
    function paginaAnterior() {
      if (offset - limit >= 0) {
        offset -= limit;
        query = `?limit=${limit}&offset=${offset}`;
        obtenerDatos();
      } else {
        mostrarMensaje("Ya estás en la primera página", "warning");
      }
    }
  
    function editarRecurso(recurso: Datos) {
      currentEdit = { ...recurso };
      editMode = true;
  
      // Redirigir al recurso seleccionado
      const recursoUrl = `/water-supply-improvements/${recurso.year}/${recurso.autonomous_community}`;
      goto(recursoUrl);
    }
  
    async function actualizarRecurso() {
      try {
        if (!currentEdit) {
          mostrarMensaje("No hay recurso seleccionado para actualizar.", "danger");
          return;
        }
        const res = await fetch(API + `/${currentEdit.year}/${currentEdit.autonomous_community}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: currentEdit.year,
            autonomous_community: currentEdit.autonomous_community,
            amount: currentEdit.amount,
            benefited_population: currentEdit.benefited_population,
            project_count: currentEdit.project_count,
          }),
        });
  
        if (res.ok) {
          mostrarMensaje("Recurso actualizado correctamente", "success");
          editMode = false;
          obtenerDatos();
        } else if (res.status === 409) {
          mostrarMensaje("Ya existe otro recurso con esos datos. No se puede modificar.", "warning");
        } else if (res.status === 400) {
          mostrarMensaje("Datos incompletos o no válidos. Revisa los campos.", "warning");
        } else {
          throw new Error();
        }
      } catch {
        mostrarMensaje("Error al intentar actualizar el recurso.", "danger");
      }
    }
  
    function cancelarEdicion() {
      editMode = false;
      currentEdit = null;
    }
  </script>
  
  <main class="container my-4">
    {#if mensaje}
      <div class="alert alert-{tipoMensaje}" role="alert">{mensaje}</div>
    {/if}
  
    <h1 class="mb-4">Gestión de Recursos de Abastecimiento de Agua</h1>
  
    <div class="d-flex gap-3 mb-2">
      <button class="btn btn-info" on:click={cargarIniciales}>Cargar datos iniciales</button>
      <button class="btn btn-danger" on:click={eliminarTodo}>Eliminar todo</button>
    </div>
  
    <h5>Búsqueda por intervalo de años</h5>
    <div class="row mb-3">
      <div class="col"><input class="form-control" placeholder="Desde" bind:value={desde} /></div>
      <div class="col"><input class="form-control" placeholder="Hasta" bind:value={hasta} /></div>
      <div class="col"><button class="btn btn-primary w-100" on:click={buscarIntervalo}>Buscar</button></div>
    </div>
  
    <h5>Filtrado por campos</h5>
    <div class="row g-2 mb-4">
      <div class="col"><input class="form-control" placeholder="Año" bind:value={busquedaYear} /></div>
      <div class="col"><input class="form-control" placeholder="Comunidad Autónoma" bind:value={busquedaComunidad} /></div>
      <div class="col"><input class="form-control" placeholder="Cantidad" bind:value={busquedaCantidad} /></div>
      <div class="col"><input class="form-control" placeholder="Población" bind:value={busquedaPoblacion} /></div>
      <div class="col"><input class="form-control" placeholder="Proyectos" bind:value={busquedaProyectos} /></div>
      <div class="col"><button class="btn btn-secondary w-100" on:click={buscar}>Filtrar</button></div>
    </div>
  
    <h5>Crear nuevo recurso</h5>
    <div class="row g-2 mb-4">
      <div class="col"><input class="form-control" placeholder="Año" bind:value={year} /></div>
      <div class="col"><input class="form-control" placeholder="Comunidad Autónoma" bind:value={comunidad} /></div>
      <div class="col"><input class="form-control" placeholder="Cantidad" bind:value={cantidad} /></div>
      <div class="col"><input class="form-control" placeholder="Población beneficiada" bind:value={poblacion} /></div>
      <div class="col"><input class="form-control" placeholder="Proyectos" bind:value={proyectos} /></div>
      <div class="col"><button class="btn btn-success w-100" on:click={crear}>Añadir</button></div>
    </div>
  
    <table class="table table-striped table-hover">
      <thead class="table-dark">
        <tr>
          <th>Año</th>
          <th>Comunidad Autónoma</th>
          <th>Cantidad (€)</th>
          <th>Población beneficiada</th>
          <th>Proyectos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each Datos as d}
          <tr>
            <td>{d.year}</td>
            <td>{d.autonomous_community}</td>
            <td>{d.amount}</td>
            <td>{d.benefited_population}</td>
            <td>{d.project_count}</td>
            <td>
              {#if editMode && currentEdit?.year === d.year}
                <button class="btn btn-success btn-sm" on:click={actualizarRecurso}>Guardar</button>
                <button class="btn btn-secondary btn-sm" on:click={cancelarEdicion}>Cancelar</button>
              {:else}
                <button class="btn btn-warning btn-sm" on:click={() => editarRecurso(d)}>Editar</button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  
    <div class="d-flex gap-3 my-3">
      <button class="btn btn-outline-primary" on:click={paginaAnterior}>Anterior</button>
      <button class="btn btn-outline-primary" on:click={siguientePagina}>Siguiente</button>
    </div>
  </main>
  