<script>
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
    import { page } from '$app/stores'; // Usamos `page` de SvelteKit para obtener la ruta activa

	let currentPage;

	// Suscribimos la ruta para determinar qué página está activa
	$: currentPage = $page.url.pathname;
</script>

<div class="layout {currentPage}">
	<Header />
	<main>
		<slot />
	</main>
	<Footer />
</div>

<style>
	/* Hacemos que el layout ocupe toda la altura de la ventana */
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	/* El main crece para rellenar el espacio disponible */
	main {
		flex: 1;
	}

	/* Opcional: aseguramos que el footer se mantenga al fondo */
	.layout footer {
		/* Si quieres un fondo: */
		/* background: #f1f1f1; */
		/* Alineación y padding */
		padding: 1rem;
		text-align: center;
	}
</style>
