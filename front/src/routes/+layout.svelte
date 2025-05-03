<script lang="ts">
	import Header from "./Header.svelte";
	import Footer from "./Footer.svelte";
	import { page } from '$app/stores';

  
	// Computamos la clase de fondo en base a la ruta
	$: bgClass = (() => {
	  const p = $page.url.pathname;
	  if (p.startsWith('/water-supply-improvements')) return 'water-supply-page';
	  if (p.startsWith('/national-parks'))         return 'parques-page';
	  if (p.startsWith('/forest-fires'))           return 'fires-page';
	 
	  // añade más rutas según necesites…
	  return 'default-page';
	})();
  </script>
  
  <div class="layout {bgClass}">
	<Header/>
  
	<main class="content">
	  <slot/>
	</main>
  
	<Footer/>
  </div>
  
  <style>
	:global(html, body) {
	  margin: 0;
	  padding: 0;
	  height: 100%;
	}
  
	.layout {
	  display: flex;
	  flex-direction: column;
	  min-height: 100vh;
	  width: 100%;
	}
	.content {
	  flex: 1;
	}

  
	/* CLASES DE FONDO POR PÁGINA */
	.water-supply-page {
	  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
	}
	.parques-page {
	  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
	}
	.fires-page {
	 
	}
	
	

	.default-page {
	  background: #fafafa;
	}
  
	
  </style>
  