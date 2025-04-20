<script>
	//@ts-nocheck
	//@ts-ignore
	import { onMount } from 'svelte';
	import {
		Button,
		Table,
		Alert,
		Dropdown,
		DropdownToggle,
		DropdownMenu,
		DropdownItem
	} from '@sveltestrap/sveltestrap';
	import { dev } from '$app/environment'; // Importing the dev variable to check the environment
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let DEVEL_HOST = 'http://localhost:16078';
	let PRODUCTION_HOST = 'https://sos2425-13.onrender.com';

	let API = '/api/v1/national-parks';
	if (dev) {
		API = DEVEL_HOST + API; // Use development host if in development mode
	} else {
		API = PRODUCTION_HOST + API; // Use production host if in production mode
	}

	let national_parks = [];
	let result = '';
	let resultStatus = '';
	let newNationalParkName;
	let newDeclarationDate;
	let newAutonomousCommunity;
	let newInitialArea;
	let newCurrentArea;
	let showCreateForm = false;
	let tipoMensaje = '';
	let mensaje = '';

	//Variables para la paginación
	let currentPage = 1;
	let itemsPerPage = 5;
	let totalItems = 0;
	let totalPages = 0;
	let isOpen = false; // Variable para controlar el estado del dropdown

	// Variables para controlar el estado del filtrado (filtrado+paginación)
	let isFiltered = false;
	let filteredParks = [];
	let filteredTotalItems = 0;
	let filteredTotalPages = 0;

	//Variables para arreglar la paginacion con filtrado
	let allParks = []; // Todos los parques (nunca cambia después de cargarse)
	let displayedParks = []; // Parques que se muestran actualmente (paginados)

	/* -------------- ORDENACIÓN DE COLUMNAS -------------- */
	let sortField = 'national_park'; // Campo por defecto para ordenar
	let sortDirection = 'asc'; // Dirección de ordenación: 'asc' o 'desc'
	let isCustomSorted = false; // Variable para controlar si se ha aplicado un ordenamiento personalizado

	// Función para cambiar el criterio de ordenación
	function sortBy(field) {
		isCustomSorted = true; // Activa la ordenación personalizada

		// Si hacemos clic en el mismo campo, invertimos la dirección
		if (field === sortField) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// Si es un campo diferente, establecemos el nuevo campo y dirección ascendente
			sortField = field;
			sortDirection = 'asc';
		}
	}

	// Función para obtener parques ordenados
	$: sortedParks = isCustomSorted
		? [...national_parks].sort((a, b) => {
				// Determina si los valores son numéricos
				const isNumeric = ['declaration_date', 'initial_area', 'current_area'].includes(sortField);

				// Compara según el tipo de dato
				let valueA = a[sortField];
				let valueB = b[sortField];

				// Conversión numérica si es necesario
				if (isNumeric) {
					valueA = Number(valueA);
					valueB = Number(valueB);
				}

				// Ordenamiento
				if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
				if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
				return 0;
			})
		: national_parks; // Si no hay ordenación personalizada, simplemente usa national_parks
	/* ----------------------------------------------------------- */

	/*-------------- FILTRADO DE PARQUES --------------*/
	let showSearchForm = false;
	let searchParams = {
		national_park: '',
		autonomous_community: '',
		from: '',
		to: '',
		initial_area_min: '',
		initial_area_max: '',
		current_area_min: '',
		current_area_max: ''
	};

	// Función para mostrar/ocultar el formulario de búsqueda
	function toggleSearchForm() {
		showSearchForm = !showSearchForm;
	}

	// Función para realizar la búsqueda + paginación con filtrado
async function searchNationalParks() {
    mensaje = '';

    // Si solo hay búsqueda por comunidad autónoma, usar el endpoint específico
    if (
        searchParams.autonomous_community &&
        !searchParams.national_park &&
        !searchParams.initial_area_min &&
        !searchParams.initial_area_max &&
        !searchParams.current_area_min &&
        !searchParams.current_area_max
    ) {
        // Si hay rango de años, usar la búsqueda general
        // Si solo hay un año específico (from=to), usar endpoint específico
        if (searchParams.from && searchParams.to && searchParams.from === searchParams.to) {
            // Usar la búsqueda específica por comunidad y año
            return await searchByCommunityAndYear();
        } else if (searchParams.from || searchParams.to) {
            // Usar el endpoint de comunidad con filtro de años
            try {
                // Usar la ruta específica para comunidad autónoma con posibles filtros de año
                const specificURL = `${API}/${encodeURIComponent(searchParams.autonomous_community)}`;

                // Añadir parámetros de año si existen
                let url = new URL(specificURL, window.location.origin);
                if (searchParams.from) url.searchParams.append('from', searchParams.from);
                if (searchParams.to) url.searchParams.append('to', searchParams.to);

                console.log('Realizando búsqueda mejorada en URL:', url.toString());

                const res = await fetch(url, { method: 'GET' });

                if (res.ok) {
                    const data = await res.json();
                    
                    // Guardar todos los resultados filtrados
                    filteredParks = Array.isArray(data) ? data : [data];
                    filteredTotalItems = filteredParks.length;
                    filteredTotalPages = Math.ceil(filteredTotalItems / itemsPerPage);
                    isFiltered = true;
                    
                    // Aplicar paginación local
                    currentPage = 1;
                    applyPagination();

                    if (filteredParks.length === 0) {
                        mostrarMensaje(
                            'No se encontraron parques que coincidan con los criterios de búsqueda.',
                            'warning'
                        );
                    } else {
                        mostrarMensaje(`Se encontraron ${filteredParks.length} parques.`, 'success');
                    }
                    return;
                } else {
                    handleApiError(res, 'búsqueda mejorada');
                    return;
                }
            } catch (error) {
                console.error('Error en búsqueda mejorada:', error);
                mostrarMensaje('Error de conexión al realizar la búsqueda mejorada.', 'error');
                return;
            }
        } else {
            // Solo comunidad sin filtros de año, usar el endpoint específico
            try {
                const specificURL = `${API}/${encodeURIComponent(searchParams.autonomous_community)}`;
                console.log('Realizando búsqueda por comunidad en URL:', specificURL);

                const res = await fetch(specificURL, { method: 'GET' });

                if (res.ok) {
                    const data = await res.json();
                    
                    // Guardar todos los resultados filtrados
                    filteredParks = Array.isArray(data) ? data : [data];
                    filteredTotalItems = filteredParks.length;
                    filteredTotalPages = Math.ceil(filteredTotalItems / itemsPerPage);
                    isFiltered = true;
                    
                    // Aplicar paginación local
                    currentPage = 1;
                    applyPagination();

                    if (filteredParks.length === 0) {
                        mostrarMensaje(
                            'No se encontraron parques que coincidan con los criterios de búsqueda.',
                            'warning'
                        );
                    } else {
                        mostrarMensaje(`Se encontraron ${filteredParks.length} parques.`, 'success');
                    }
                    return;
                } else {
                    handleApiError(res, 'búsqueda por comunidad');
                    return;
                }
            } catch (error) {
                console.error('Error en búsqueda por comunidad:', error);
                mostrarMensaje('Error de conexión al realizar la búsqueda por comunidad.', 'error');
                return;
            }
        }
    }

    // Si llegamos aquí, usamos la búsqueda general normal
    // Construir la URL con los parámetros de búsqueda
    let url = new URL(API, window.location.origin);

    // Añadir parámetros no vacíos
    if (searchParams.national_park)
        url.searchParams.append('national_park', searchParams.national_park);
    if (searchParams.autonomous_community)
        url.searchParams.append('autonomous_community', searchParams.autonomous_community);
    if (searchParams.from) url.searchParams.append('from', searchParams.from);
    if (searchParams.to) url.searchParams.append('to', searchParams.to);

    // Para áreas, usar lógica adicional en el backend
    if (searchParams.initial_area_min)
        url.searchParams.append('initial_area_min', searchParams.initial_area_min);
    if (searchParams.initial_area_max)
        url.searchParams.append('initial_area_max', searchParams.initial_area_max);
    if (searchParams.current_area_min)
        url.searchParams.append('current_area_min', searchParams.current_area_min);
    if (searchParams.current_area_max)
        url.searchParams.append('current_area_max', searchParams.current_area_max);

    console.log('Realizando búsqueda general en URL:', url.toString());

    try {
        const res = await fetch(url, { method: 'GET' });
        
        if (res.ok) {
            const data = await res.json();
            
            // Guardar todos los resultados filtrados
            filteredParks = data;
            filteredTotalItems = data.length;
            filteredTotalPages = Math.ceil(filteredTotalItems / itemsPerPage);
            isFiltered = true;
            
            // Actualizar la interfaz con los datos de paginación filtrada
            totalItems = filteredTotalItems;
            totalPages = filteredTotalPages;
            
            // Aplicar paginación local
            currentPage = 1;
            applyPagination();

            if (data.length === 0) {
                mostrarMensaje(
                    'No se encontraron parques que coincidan con los criterios de búsqueda.',
                    'warning'
                );
            } else {
                mostrarMensaje(`Se encontraron ${data.length} parques.`, 'success');
            }
            
            // Debug
            console.log('Después de filtrar:', {
                isFiltered,
                filteredParks: filteredParks.length,
                filteredTotalPages
            });
        } else {
            handleApiError(res, 'búsqueda general');
        }
    } catch (error) {
        console.error('Error al realizar la búsqueda general:', error);
        mostrarMensaje('Error de conexión al realizar la búsqueda.', 'error');
    }
}

// Función auxiliar para manejar errores de API de manera consistente
function handleApiError(response, operacion) {
    console.error(`Error en ${operacion}: ${response.status}`);
    
    if (response.status === 400) {
        mostrarMensaje('Parámetros de búsqueda inválidos.', 'warning');
    } else if (response.status === 404) {
        mostrarMensaje('No se encontraron resultados con esos criterios.', 'warning');
    } else if (response.status >= 500) {
        mostrarMensaje('Error del servidor. Inténtelo más tarde.', 'error');
    } else {
        mostrarMensaje(`Error al realizar la ${operacion}. Código: ${response.status}`, 'error');
    }
}
	/* ----------------------------------------------------------- */

	/* ------------------ LIMPIAR LOS CAMPOS DE LA BÚSQUEDAS Y EL FILTRADO ------------------------- */
	function clearSearchForm() {
		// Resetear todos los campos de búsqueda
		searchParams = {
			national_park: '',
			autonomous_community: '',
			from: '',
			to: '',
			initial_area_min: '',
			initial_area_max: '',
			current_area_min: '',
			current_area_max: ''
		};
		/* ------------------ DEBUGGING ------------------ */
		// Al final de clearSearchForm
		console.log('Después de limpiar filtros:', {
			isFiltered,
			filteredParks: filteredParks.length
		});
		// Resetear la bandera de intento de búsqueda
		searchIntent = false;
		// Resetear el estado de filtrado
		isFiltered = false;
		filteredParks = [];

		// Recargar todos los parques
		getNationalParks();

		// Mostrar mensaje de confirmación
		mostrarMensaje('Búsqueda limpiada. Mostrando todos los parques.', 'info');
	}
	/* ------------------------------------------------------------------------------------------ */

	/* -------------- BÚSQUEDA RÁPIDA (por comunidad autónoma y año de declaración) -------------- */
	let showQuickSearch = false; // Variable para controlar la visibilidad de la búsqueda rápida

	function toggleQuickSearch() {
		showQuickSearch = !showQuickSearch;
	}

	async function searchByCommunityAndYear() {
		// Verificar que tenemos comunidad y un año específico (from = to)
		if (!searchParams.autonomous_community) {
			mostrarMensaje('Debe especificar una comunidad autónoma', 'warning');
			return;
		}

		if (!searchParams.from || !searchParams.to || searchParams.from !== searchParams.to) {
			mostrarMensaje(
				"Para búsqueda específica, 'Año desde' y 'Año hasta' deben coincidir",
				'warning'
			);
			return;
		}

		try {
			// Usar la ruta especial del backend
			const specificURL = `${API}/${encodeURIComponent(searchParams.autonomous_community)}/${searchParams.from}`;
			console.log('Realizando búsqueda en URL:', specificURL);

			const res = await fetch(specificURL, { method: 'GET' });
			console.log('Respuesta status:', res.status);

			if (res.ok) {
				const data = await res.json();
				console.log('Datos recibidos:', JSON.stringify(data));

				// Si devuelve un objeto en lugar de array, convertirlo a array
				const parksData = Array.isArray(data) ? data : [data];

				// Actualizar el estado de filtrado
				filteredParks = parksData;
				filteredTotalItems = parksData.length;
				filteredTotalPages = Math.ceil(filteredTotalItems / itemsPerPage);
				isFiltered = true;

				// Aplicar paginación local
				currentPage = 1;
				const endIndex = Math.min(itemsPerPage, filteredParks.length);
				national_parks = filteredParks.slice(0, endIndex);

				// Actualizar totales para la interfaz
				totalItems = filteredTotalItems;
				totalPages = filteredTotalPages;

				if (parksData.length === 0) {
					mostrarMensaje(
						`No se encontraron parques en ${searchParams.autonomous_community} declarados en ${searchParams.from}.`,
						'warning'
					);
				} else {
					mostrarMensaje(
						`Se encontraron ${parksData.length} parques en ${searchParams.autonomous_community} declarados en ${searchParams.from}.`,
						'success'
					);
				}
			} else {
				const errorText = await res.text();
				console.error('Error en la respuesta:', errorText);
				try {
					const errorData = JSON.parse(errorText);
					mostrarMensaje(
						`Error: ${errorData.message || 'Error al realizar la búsqueda específica.'}`,
						'error'
					);
				} catch (e) {
					mostrarMensaje(
						`Error al realizar la búsqueda específica. Status: ${res.status}`,
						'error'
					);
				}
			}
		} catch (error) {
			console.error('Error en búsqueda específica:', error);
			mostrarMensaje('Error de conexión al realizar la búsqueda específica.', 'error');
		}
	}

	/* ------------------ DEBUGGING ------------------ */
	// Al final de searchNationalParks y searchByCommunityAndYear
	console.log('Después de filtrar:', {
		isFiltered,
		filteredParks: filteredParks.length,
		filteredTotalPages
	});

	/* ----------------------------------------------------------- */

	let searchIntent = false; // Variable para controlar si el usuario ha intentado buscar (búsqueda rápida)

	// Función para mostrar/ocultar el formulario
	function toggleCreateForm() {
		showCreateForm = !showCreateForm;
	}
	// Función para limpiar todos los campos
	function clearCreateForm() {
		// Limpiar todos los campos del formulario
		newNationalParkName = '';
		newDeclarationDate = '';
		newAutonomousCommunity = '';
		newInitialArea = '';
		newCurrentArea = '';

		// Opcional: mostrar un mensaje de confirmación
		mostrarMensaje('Campos del formulario limpiados', 'info');
	}
	// Función para mostrar mensajes
	function mostrarMensaje(texto, tipo = 'info') {
		mensaje = texto;
		tipoMensaje = tipo;
		setTimeout(() => (mensaje = ''), 5000);
	}

	/* ----------------------------------- PAGINACIÓN ------------------------------------ */

	// Versión mejorada de goToPage con mejora en la paginacion
	function goToPage(page) {
    console.log('goToPage:', { page, isFiltered, filteredParks: filteredParks?.length || 0 });

    // Comprobación defensiva: si hay datos filtrados, usamos esos independientemente del valor de isFiltered
    if (filteredParks && filteredParks.length > 0) {
        // Si tenemos datos filtrados, rectificamos el estado
        isFiltered = true;
        
        if (page >= 1 && page <= filteredTotalPages) {
            currentPage = page;
            // Usar la función centralizada de paginación
            applyPagination();
        }
    } else {
        // Si no hay datos filtrados, comportamiento normal
        isFiltered = false;
        
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            // Si tienes todos los parques en memoria (allParks)
            if (allParks && allParks.length > 0) {
                applyPagination();
            } else {
                // Si no tienes los datos en memoria, obtenerlos del servidor
                getNationalParks();
            }
        }
    }
}

	function nextPage() {
		const maxPage = filteredParks && filteredParks.length > 0 ? filteredTotalPages : totalPages;

		if (currentPage < maxPage) {
			goToPage(currentPage + 1);
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			goToPage(currentPage - 1);
		}
	}
	function changeItemsPerPage(newValue) {
		itemsPerPage = newValue;
		currentPage = 1; // Resetear a la primera página cuando cambia items por página

		if (isFiltered) {
			filteredTotalPages = Math.ceil(filteredTotalItems / itemsPerPage);
			goToPage(1); // Esto aplicará la paginación local con el nuevo tamaño
		} else {
			getNationalParks();
		}
	}
	function applyPagination() {
    const sourceData = isFiltered ? filteredParks : allParks;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, sourceData.length);
    
    displayedParks = sourceData.slice(startIndex, endIndex);
    national_parks = displayedParks; // Actualiza la variable que muestra la UI
    
    console.log(`Mostrando ${isFiltered ? 'resultados filtrados' : 'todos los parques'}:`, 
                { page: currentPage, displayed: displayedParks.length, total: sourceData.length });
}


	/* --------------------------------------------------------------------------------------*/

	/* ------------------ FUNCIONES DE API ------------------ */

	/* ------------------ DEBUGGING ------------------ */
	// Al inicio de getNationalParks
	console.log('Inicio de getNationalParks:', { isFiltered });

	// Devolver todos los parques nacionales + paginación
	async function getNationalParks() {
    // No resetear el resultado si estamos en modo filtrado
    if (!isFiltered) {
        resultStatus = result = '';
    }
    
    // Si estamos en modo filtrado, aplicar paginación local
    if (isFiltered && filteredParks && filteredParks.length > 0) {
        console.log('Aplicando paginación local a resultados filtrados');
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredParks.length);
        national_parks = filteredParks.slice(startIndex, endIndex);
        return; // Importante: salir de la función sin hacer peticiones a la API
    }
    
    // Continuar con el comportamiento normal para datos no filtrados
    try {
        // Obtener primero el total de parques
        const countRes = await fetch(API, { method: 'GET' });

        if (!countRes.ok) {
            // Manejo de errores como ya lo tienes
            if (countRes.status === 404) {
                console.log('No National Parks found');
                result = "No hay datos de parques nacionales. Utiliza el botón 'Cargar datos iniciales'.";
                resultStatus = 'warning';
                return;
            } else if (countRes.status >= 500) {
                console.log(`Server error (${countRes.status}) when retrieving National Parks`);
                result = 'El servidor no pudo procesar la solicitud. Inténtelo más tarde.';
                resultStatus = 'error';
                return;
            } else {
                console.log(`Error retrieving National Parks: ${countRes.status}`);
                result = `Error al obtener los parques nacionales. Código: ${countRes.status}`;
                resultStatus = 'error';
                return;
            }
        }

        const allData = await countRes.json();
        totalItems = allData.length;
        totalPages = Math.ceil(totalItems / itemsPerPage);

        // Ajustar la página actual si es necesario
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }

        // Calcular offset basado en la página actual
        const offset = (currentPage - 1) * itemsPerPage;

        // Realizar la consulta paginada
        const res = await fetch(`${API}?limit=${itemsPerPage}&offset=${offset}`, { method: 'GET' });
        const data = await res.json();

        // El resto de tu código para el highlight, etc.
        const highlight = $page.url.searchParams.get('highlight');
        if (highlight) {
            const idx = data.findIndex((p) => p.national_park === highlight);
            if (idx > -1) {
                const [park] = data.splice(idx, 1);
                data.unshift(park);
                isCustomSorted = false;
            }
        }

        national_parks = data;

        // Verificar si no hay parques y mostrar mensaje
        if (national_parks.length === 0) {
            result = "No hay datos de parques nacionales. Utiliza el botón 'Cargar datos iniciales'.";
            resultStatus = 'warning';
        }

        console.log(`Response received: \n${JSON.stringify(national_parks, null, 2)}`);
    } catch (error) {
        console.log(`Error getting data from ${API}: ${error}`);
        result = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
        resultStatus = 'error';
    }
}


	// Crear un nuevo parque nacional
	async function createNationalPark() {
		// Resetea los mensajes
		result = resultStatus = '';
		mensaje = '';

		// Guarda el nombre para usarlo después
		const parkNameToHighlight = newNationalParkName;

		try {
			const res = await fetch(API, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					national_park: newNationalParkName,
					declaration_date: newDeclarationDate,
					autonomous_community: newAutonomousCommunity,
					initial_area: newInitialArea,
					current_area: newCurrentArea
				})
			});

			if (res.status === 201) {
				console.log(`National Park created successfully: ${parkNameToHighlight}`);
				mostrarMensaje('Parque nacional creado correctamente', 'success');

				// Ocultar el formulario después de crear
				showCreateForm = false;

				// Desactivar la ordenación personalizada para que el nuevo parque aparezca arriba
				isCustomSorted = false;
				// Limpiar los campos del formulario
				newNationalParkName = '';
				newDeclarationDate = '';
				newAutonomousCommunity = '';
				newInitialArea = '';
				newCurrentArea = '';

				// Obtener la lista actualizada y procesarla manualmente
				const fetchRes = await fetch(API, { method: 'GET' });
				const data = await fetchRes.json();

				// Encuentra el nuevo parque y colócalo primero
				const idx = data.findIndex((p) => p.national_park === parkNameToHighlight);
				if (idx > -1) {
					const [park] = data.splice(idx, 1);
					data.unshift(park);
				}

				national_parks = data;
			} else if (res.status === 400) {
				console.log(`Bad request when creating National Park: ${parkNameToHighlight}`);
				mostrarMensaje(
					`No se pudo crear el parque '${parkNameToHighlight}'. Verifique que todos los campos sean correctos.`,
					'warning'
				);
			} else if (res.status === 409) {
				console.log(`Conflict when creating National Park: ${parkNameToHighlight}`);
				mostrarMensaje(
					`Ya existe un parque nacional con el nombre '${parkNameToHighlight}'.`,
					'warning'
				);
			} else if (res.status === 422) {
				console.log(`Validation error when creating National Park: ${parkNameToHighlight}`);
				mostrarMensaje(
					`Los datos proporcionados no son válidos. Revise que el formato sea correcto.`,
					'warning'
				);
			} else if (res.status >= 500) {
				console.log(
					`Server error (${res.status}) when creating National Park: ${parkNameToHighlight}`
				);
				mostrarMensaje(`El servidor no pudo procesar la solicitud. Inténtelo más tarde.`, 'error');
			} else {
				console.log(`Failed to create national park: ${res.status}`);
				mostrarMensaje(
					`Error al crear el parque nacional. Código de error: ${res.status}`,
					'error'
				);
			}
		} catch (error) {
			console.log(`Error creating the National Park ${API}: ${error}`);
			mostrarMensaje(
				'No se pudo conectar con el servidor. Verifique su conexión a internet.',
				'error'
			);
		}
	}

	// Eliminar un parque nacional
	async function deleteNationalPark(national_park) {
		mensaje = '';

		try {
			const res = await fetch(`${API}/${national_park}`, { method: 'DELETE' });

			// Manejar diferentes códigos de error con mensajes específicos
			if (res.status === 200) {
				console.log(`National Park '${national_park}' deleted successfully`);
				mostrarMensaje(`Parque nacional '${national_park}' eliminado correctamente`, 'success');
				getNationalParks();
			} else if (res.status === 404) {
				console.log(`National Park ${national_park} not found`);
				mostrarMensaje(
					`No se encontró un parque nacional con el nombre '${national_park}'`,
					'warning'
				);
			} else if (res.status === 409) {
				console.log(`Conflict when deleting National Park ${national_park}`);
				mostrarMensaje(
					`No se puede eliminar '${national_park}' porque está siendo utilizado por otros datos`,
					'warning'
				);
			} else if (res.status >= 500) {
				console.log(`Server error (${res.status}) when deleting National Park ${national_park}`);
				mostrarMensaje(
					`El servidor no pudo procesar la solicitud de eliminar '${national_park}'. Inténtelo más tarde.`,
					'error'
				);
			} else {
				console.log(`Error deleting National Park ${national_park}: status received ${res.status}`);
				mostrarMensaje(`Error al eliminar el parque nacional '${national_park}'`, 'error');
			}
		} catch (error) {
			console.log(`Error deleting data from ${API}: ${error}`);
			mostrarMensaje(
				'No se pudo conectar con el servidor para eliminar el parque nacional. Compruebe su conexión a internet.',
				'error'
			);
		}
	}

	//Borrar todos los parques nacionales
	async function deleteAllNationalParks() {
		mensaje = '';

		if (national_parks.length === 0) {
			mostrarMensaje('No hay parques nacionales para borrar.', 'info');
			return;
		}

		try {
			const res = await fetch(API, { method: 'DELETE' });
			const status = res.status;

			if (status === 200) {
				console.log('All National Parks deleted successfully');
				mostrarMensaje('Todos los parques nacionales han sido borrados.', 'success');
				getNationalParks(); // Refresh the list after deletion
			} else if (status === 404) {
				console.log('No National Parks found to delete');
				mostrarMensaje('No se encontraron parques nacionales para borrar.', 'warning');
			} else if (status === 403) {
				console.log('Forbidden to delete all National Parks');
				mostrarMensaje('No tiene permisos para borrar todos los parques nacionales.', 'warning');
			} else if (status >= 500) {
				console.log(`Server error (${status}) when deleting all National Parks`);
				mostrarMensaje('El servidor no pudo procesar la solicitud. Inténtelo más tarde.', 'error');
			} else {
				console.log(`Error deleting all national parks: status received ${status}`);
				mostrarMensaje(
					`No se pudieron borrar todos los parques nacionales. Código de error: ${status}`,
					'error'
				);
			}
		} catch (error) {
			console.log(`Error deleting data from ${API}: ${error}`);
			mostrarMensaje(
				'No se pudo conectar con el servidor. Verifique su conexión a internet.',
				'error'
			);
		}
	}

	//loadInitialData
	async function loadInitialData() {
		mensaje = '';

		try {
			// Usa el endpoint específico para cargar datos iniciales
			const res = await fetch(`${API}/loadInitialData`, { method: 'GET' });

			if (res.ok) {
				console.log('Initial data loaded successfully');
				mostrarMensaje('Datos iniciales cargados correctamente.', 'success');
				// Refresca la lista de parques
				await getNationalParks();
			} else if (res.status === 409) {
				console.log('Conflict when loading initial data');
				mostrarMensaje(
					'No se pueden cargar los datos iniciales porque ya existen parques en la base de datos.',
					'warning'
				);
			} else if (res.status >= 500) {
				console.log(`Server error (${res.status}) when loading initial data`);
				mostrarMensaje(
					'El servidor no pudo cargar los datos iniciales. Inténtelo más tarde.',
					'error'
				);
			} else {
				console.log(`Error loading initial data: status received ${res.status}`);
				mostrarMensaje(
					`No se pudieron cargar los datos iniciales. Código de error: ${res.status}`,
					'error'
				);
			}
		} catch (error) {
			console.log(`Error loading initial data: ${error}`);
			mostrarMensaje(
				'No se pudo conectar con el servidor. Verifique su conexión a internet.',
				'error'
			);
		}
	}

	onMount(async () => {
		getNationalParks();
	});
</script>

<svelte:head>
	<title>Parques Nacionales</title>
</svelte:head>

<h2 style="text-align: center; margin-top: 1rem; margin-bottom: 1rem;">
	Parques Nacionales de España
</h2>
<!-- Botonera de acceso rápidos -->
<div style="text-align: center; margin-bottom: 1rem;">
	<Button color="danger" on:click={deleteAllNationalParks}>❌ Borrar todo</Button>
	<Button color="secondary" on:click={loadInitialData}>💾 Cargar datos iniciales</Button>
	<Button color="success" on:click={toggleCreateForm}>
		{showCreateForm ? ' 🚫 Cancelar' : ' ➕  Crear Parque'}
	</Button>
	<Button color="warning" on:click={toggleQuickSearch}>
		{showQuickSearch ? '❌ Cerrar búsqueda rápida' : ' 🔥 Búsqueda rápida'}
	</Button>
	<Button color="info" on:click={toggleSearchForm}>
		{showSearchForm ? '❌ Cerrar filtrado' : ' 🔍 Filtrar parques'}
	</Button>
</div>
<!-- Búsqueda rápida por comunidad autónoma y año de declaración (ahora desplegable) -->
{#if showQuickSearch}
	<div
		style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; margin-bottom: 1.5rem; gap: 10px; background-color: #f0f8ff; padding: 10px 10px 5px 10px; border-radius: 5px;"
	>
		<div style="margin-bottom: 5px; display: flex; align-items: center; height: 38px;">
			<strong>Búsqueda rápida:</strong>
		</div>

		<div style="width: 200px; position: relative; margin-bottom: 5px;">
			<input
				class="form-control"
				style={!searchParams.autonomous_community && searchIntent ? 'border-color: #dc3545;' : ''}
				placeholder="Comunidad Autónoma"
				bind:value={searchParams.autonomous_community}
			/>
			<div style="position: absolute; left: 0; top: 100%; color: #dc3545; font-size: 0.875em;">
				{#if !searchParams.autonomous_community && searchIntent}
					Debes especificar una comunidad autónoma
				{/if}
			</div>
		</div>

		<div style="width: 120px; position: relative; margin-bottom: 5px;">
			<input
				class="form-control"
				style={!searchParams.from && searchIntent ? 'border-color: #dc3545;' : ''}
				type="number"
				placeholder="Año"
				bind:value={searchParams.from}
				on:input={() => (searchParams.to = searchParams.from)}
				min="1800"
				max={new Date().getFullYear()}
			/>
			<div style="position: absolute; left: 0; top: 100%; color: #dc3545; font-size: 0.875em;">
				{#if !searchParams.from && searchIntent}
					Debes especificar un año
				{/if}
			</div>
		</div>

		<div style="margin-bottom: 5px;">
			<Button
				color="primary"
				on:click={() => {
					searchIntent = true;
					if (searchParams.autonomous_community && searchParams.from) {
						searchByCommunityAndYear();
					}
				}}
				style="margin-right: 0.5rem;"
			>
				Buscar por Comunidad y Año
			</Button>
			<Button
				color="secondary"
				on:click={() => {
					searchIntent = false;
					clearSearchForm();
				}}
			>
				Limpiar
			</Button>
		</div>
	</div>
{/if}
<!-- Formulario de búsqueda -->
{#if showSearchForm}
	<div
		style="margin-bottom: 1.5rem; padding: 1rem; background-color: #f8f9fa; border-radius: 0.3rem;"
	>
		<h4 style="margin-bottom: 1rem;">Filtrar Parques Nacionales</h4>

		<div class="row mb-3">
			<div class="col">
				<label for="searchName">Nombre del Parque:</label>
				<input
					id="searchName"
					class="form-control"
					bind:value={searchParams.national_park}
					placeholder="Ej: Sierra Nevada"
				/>
			</div>
			<div class="col">
				<label for="searchCommunity">Comunidad Autónoma:</label>
				<input
					id="searchCommunity"
					class="form-control"
					bind:value={searchParams.autonomous_community}
					placeholder="Ej: Andalucía"
				/>
			</div>
		</div>

		<div class="row mb-3">
			<div class="col">
				<label for="searchFrom">Año desde:</label>
				<input
					id="searchFrom"
					class="form-control"
					type="number"
					bind:value={searchParams.from}
					min="1800"
					max={new Date().getFullYear()}
					placeholder="Ej: 1950"
				/>
			</div>
			<div class="col">
				<label for="searchTo">Año hasta:</label>
				<input
					id="searchTo"
					class="form-control"
					type="number"
					bind:value={searchParams.to}
					min="1800"
					max={new Date().getFullYear()}
					placeholder="Ej: 2020"
				/>
			</div>
		</div>

		<div class="row mb-3">
			<div class="col">
				<label for="searchInitAreaMin">Área inicial mínima (ha):</label>
				<input
					id="searchInitAreaMin"
					class="form-control"
					type="number"
					bind:value={searchParams.initial_area_min}
					min="1"
					placeholder="Ej: 5000"
				/>
			</div>
			<div class="col">
				<label for="searchInitAreaMax">Área inicial máxima (ha):</label>
				<input
					id="searchInitAreaMax"
					class="form-control"
					type="number"
					bind:value={searchParams.initial_area_max}
					min="1"
					placeholder="Ej: 50000"
				/>
			</div>
		</div>

		<div class="row mb-3">
			<div class="col">
				<label for="searchCurrAreaMin">Área actual mínima (ha):</label>
				<input
					id="searchCurrAreaMin"
					class="form-control"
					type="number"
					bind:value={searchParams.current_area_min}
					min="1"
					placeholder="Ej: 5000"
				/>
			</div>
			<div class="col">
				<label for="searchCurrAreaMax">Área actual máxima (ha):</label>
				<input
					id="searchCurrAreaMax"
					class="form-control"
					type="number"
					bind:value={searchParams.current_area_max}
					min="1"
					placeholder="Ej: 50000"
				/>
			</div>
		</div>

		<div class="text-center">
			<Button color="primary" on:click={searchNationalParks} style="margin-right: 0.5rem;">
				Buscar
			</Button>
			<Button color="secondary" on:click={clearSearchForm}>Limpiar</Button>
		</div>
	</div>
{/if}

<!-- Componente de mensaje -->
{#if mensaje}
	<Alert
		color={tipoMensaje === 'success'
			? 'success'
			: tipoMensaje === 'error'
				? 'danger'
				: tipoMensaje === 'warning'
					? 'warning'
					: 'info'}
		isOpen={!!mensaje}
		toggle={() => (mensaje = '')}
		className="text-center fw-bold"
		style="margin: 0 auto 1rem auto; max-width: 600px;"
	>
		{mensaje}
	</Alert>
{/if}
<!-- Formulario desplegable para crear nuevo parque -->
{#if showCreateForm}
	<div
		style="margin-bottom: 1.5rem; padding: 1rem; background-color: #f8f9fa; border-radius: 0.3rem;"
	>
		<h4 style="margin-bottom: 1rem;">Crear Nuevo Parque Nacional</h4>

		<!-- Colocar el Alert fuera de la estructura de fila -->
		{#if result}
			<Alert
				color={resultStatus === 'success'
					? 'success'
					: resultStatus === 'error'
						? 'danger'
						: resultStatus === 'warning'
							? 'warning'
							: 'info'}
				isOpen={!!result}
				toggle={() => (result = '')}
				className="text-center fw-bold"
				style="margin-bottom: 1rem;"
			>
				{result}
			</Alert>
		{/if}

		<div class="row">
			<!-- Añadido el campo para el nombre del parque que faltaba -->
			<div class="col">
				<label for="parkName">Nombre del Parque:</label>
				<input
					id="parkName"
					class="form-control"
					bind:value={newNationalParkName}
					placeholder="Ej: Sierra de las Nieves"
				/>
			</div>
			<div class="col">
				<label for="declarationDate">Año de declaración:</label>
				<input
					id="declarationDate"
					class="form-control"
					type="number"
					bind:value={newDeclarationDate}
					min="1800"
					max={new Date().getFullYear()}
					placeholder="Ej: 1999"
				/>
			</div>
			<div class="col">
				<label for="community">Comunidad Autónoma:</label>
				<input
					id="community"
					class="form-control"
					bind:value={newAutonomousCommunity}
					placeholder="Ej: Andalucía"
				/>
			</div>
			<div class="col">
				<label for="initialArea">Superficie inicial (ha):</label>
				<input
					id="initialArea"
					class="form-control"
					type="number"
					bind:value={newInitialArea}
					min="1"
					placeholder="Ej: 10000"
				/>
			</div>
			<div class="col">
				<label for="currentArea">Superficie actual (ha):</label>
				<input
					id="currentArea"
					class="form-control"
					type="number"
					bind:value={newCurrentArea}
					min="1"
					placeholder="Ej: 12000"
				/>
			</div>
			<div class="col-auto d-flex align-items-end gap-2">
				<Button color="primary" on:click={createNationalPark} style="margin-top: 1.5rem;">
					<span class="glyphicon glyphicon-ok"></span> Crear
				</Button>
				<Button color="secondary" on:click={clearCreateForm} style="margin-top: 1.5rem;">
					<span class="glyphicon glyphicon-erase"></span> Limpiar
				</Button>
			</div>
		</div>
	</div>
{/if}
<Table hover>
	<thead>
		<tr>
			<th style="cursor: pointer" on:click={() => sortBy('national_park')}>
				Nombre {sortField === 'national_park' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
			</th>
			<th style="cursor: pointer" on:click={() => sortBy('declaration_date')}>
				Fecha de declaración {sortField === 'declaration_date'
					? sortDirection === 'asc'
						? '↑'
						: '↓'
					: ''}
			</th>
			<th style="cursor: pointer" on:click={() => sortBy('autonomous_community')}>
				Comunidad Autónoma {sortField === 'autonomous_community'
					? sortDirection === 'asc'
						? '↑'
						: '↓'
					: ''}
			</th>
			<th style="cursor: pointer" on:click={() => sortBy('initial_area')}>
				Área inicial (ha) {sortField === 'initial_area'
					? sortDirection === 'asc'
						? '↑'
						: '↓'
					: ''}
			</th>
			<th style="cursor: pointer" on:click={() => sortBy('current_area')}>
				Área actual (ha) {sortField === 'current_area' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
			</th>
			<th>Acciones</th>
		</tr>
	</thead>
	<tbody>
		{#each sortedParks as park}
			<tr>
				<td><a href="/national-parks/{park.national_park}">{park.national_park}</a></td>
				<td>{park.declaration_date}</td>
				<td>{park.autonomous_community}</td>
				<td>{park.initial_area}</td>
				<td>{park.current_area}</td>
				<td>
					<Button color="danger" on:click={() => deleteNationalPark(park.national_park)}
						>Eliminar</Button
					>
				</td>
			</tr>
		{/each}
	</tbody>
</Table>

<!-- Controles de paginación con nuevo esquema de colores -->
{#if (isFiltered ? filteredTotalPages : totalPages) > 0}
	<div
		style="display: flex; justify-content: center; align-items: center; margin-top: 1rem; flex-wrap: wrap; gap: 10px; background-color: #f8f9fa; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
	>
		<!-- Selector de elementos por página con nuevo color -->
		<div style="display: flex; align-items: center; gap: 8px;">
			<span>Elementos por página:</span>
			<Dropdown {isOpen} toggle={() => (isOpen = !isOpen)}>
				<DropdownToggle color="primary" caret>
					{itemsPerPage}
				</DropdownToggle>
				<DropdownMenu>
					{#each [5, 10, 15, 20] as size}
						<DropdownItem
							active={itemsPerPage === size}
							on:click={(e) => {
								e.preventDefault();
								changeItemsPerPage(size);
								setTimeout(() => {
									isOpen = false;
								}, 0);
							}}
						>
							{size}
						</DropdownItem>
					{/each}
				</DropdownMenu>
			</Dropdown>
		</div>

		<!-- Navegación de páginas con nuevos colores -->
		<div style="display: flex; align-items: center; gap: 5px;">
			<Button color="primary" on:click={prevPage} disabled={currentPage === 1}>⬅️ Anterior</Button>

			<!-- Mostrar números de página con nuevos colores -->
			<div style="display: flex; gap: 5px;">
				{#if totalPages <= 7}
					{#each Array(totalPages) as _, i}
						<Button
							color={currentPage === i + 1 ? 'primary' : 'outline-primary'}
							on:click={() => goToPage(i + 1)}
						>
							{i + 1}
						</Button>
					{/each}
				{:else}
					<!-- Números de página con elipsis con nuevos colores -->
					{#if currentPage > 1}
						<Button color="outline-primary" on:click={() => goToPage(1)}>1</Button>
					{/if}

					{#if currentPage > 3}
						<span style="align-self: center; color: #0d6efd;">...</span>
					{/if}

					{#if currentPage > 2}
						<Button color="outline-primary" on:click={() => goToPage(currentPage - 1)}>
							{currentPage - 1}
						</Button>
					{/if}

					<Button color="primary" disabled>{currentPage}</Button>

					{#if currentPage < totalPages - 1}
						<Button color="outline-primary" on:click={() => goToPage(currentPage + 1)}>
							{currentPage + 1}
						</Button>
					{/if}

					{#if currentPage < totalPages - 2}
						<span style="align-self: center; color: #0d6efd;">...</span>
					{/if}

					{#if currentPage < totalPages}
						<Button color="outline-primary" on:click={() => goToPage(totalPages)}>
							{totalPages}
						</Button>
					{/if}
				{/if}
			</div>

			<Button color="primary" on:click={nextPage} disabled={currentPage === totalPages}>
				Siguiente ➡️
			</Button>
		</div>

		<!-- Información de paginación con nuevo color -->
		<div
			style="background-color: #e7f5ff; padding: 6px 12px; border-radius: 4px; font-weight: 500; color: #0d6efd;"
		>
			Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(
				currentPage * itemsPerPage,
				isFiltered ? filteredTotalItems : totalItems
			)} de {isFiltered ? filteredTotalItems : totalItems} parques
			{#if isFiltered}
				<span style="font-style: italic;">(Resultados filtrados)</span>
			{/if}
		</div>
	</div>
{/if}
