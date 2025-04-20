<script>
    import Header from "./Header.svelte";
    import Footer from "./Footer.svelte";
</script>
<link rel="preload" href="/_app/immutable/assets/0.Ayp-8-GK.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

<main>
    <Header/>
    <hr/>
    <slot></slot>
    <hr/>
    <Footer/>
</main>