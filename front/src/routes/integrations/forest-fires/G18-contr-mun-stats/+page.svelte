<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import ApexCharts from 'apexcharts';
	import { dev } from '$app/environment';

	// URLs para las APIs
	const FIRES_API = dev
		? 'http://localhost:16078/api/v1/forest-fires'
		: 'https://sos2425-13.onrender.com/api/v1/forest-fires';
	const PENSIONS_API = dev
		? 'http://localhost:16078/api/v1/proxy/contr-mun-stats'
		: 'https://sos2425-13.onrender.com/api/v1/proxy/contr-mun-stats';