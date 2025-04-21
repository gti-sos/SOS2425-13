// @ts-check
import { test, expect } from '@playwright/test';

// FUNCION QUE EDITA UN REGISTRO EXIXTENTE (HAY QUE ASEGURARSE QUE ESTE REGISTRO ESTA EN NUESTRA BASE DE DATOS)

test.describe('Editar incendio forestal', () => {  
	const year = 2024;
	const autonomous_community = 'andalucia'; 
	const encodedCommunity = encodeURIComponent(autonomous_community);
	const editUrl = `/forest-fires/${year}/${encodedCommunity}`;

	test('Carga la vista de edición correctamente', async ({ page }) => {
		await page.goto(editUrl);

		await expect(page.getByText(`Editar incendio: ${autonomous_community} - ${year}`)).toBeVisible();
		await expect(page.locator('input#accidentes')).toBeVisible();
		await expect(page.locator('input#porcentaje')).toBeVisible();
	});


	test.describe('Crear incendio forestal', () => {
		const listUrl = '/forest-fires';
	  
		test('Muestra error con porcentaje inválido (>1)', async ({ page }) => {
			await page.goto(listUrl);
			await page.waitForLoadState('networkidle');
			
			// Desactivar la validación nativa del formulario
			await page.evaluate(() => {
			  const form = document.querySelector('form:has(button[type="submit"])');
			  if (form) {
				form.setAttribute('novalidate', '');
			  }
			});
			
			// Rellenar el formulario
			await page.locator('form:has(button:text("✅ Crear recurso")) input[placeholder="Año"]').fill('2022');
			await page.locator('form:has(button:text("✅ Crear recurso")) input[placeholder="Comunidad Autónoma"]').fill('Extremadura');
			await page.locator('form:has(button:text("✅ Crear recurso")) input[placeholder="Accidentes"]').fill('500');
			await page.locator('form:has(button:text("✅ Crear recurso")) input[placeholder="% Grandes Incendios (0-1)"]').fill('1.5');
			
			await page.getByRole('button', { name: '✅ Crear recurso' }).click();
			
			// Buscar el mensaje de error
			await expect(page.getByText('⚠️ El porcentaje debe estar entre 0 y 1.')).toBeVisible({ timeout: 10000 });
		  });
	  });

	
});

/*----------------------- OTROS TESTS -----------------------*/
test('Muestra el título correcto de la página', async ({ page }) => {
	// Navegar a la página de incendios forestales
	await page.goto('/forest-fires');
	
	// Esperar a que la página se cargue completamente
	await page.waitForLoadState('networkidle');
	
	// Verificar que el título está presente y visible
	await expect(
	  page.getByRole('heading', { name: '🔥 Gestión de Incendios Forestales' })
	).toBeVisible();
	
	// Alternativa: usar un selector más genérico si el rol no fuera confiable
	// await expect(page.getByText('🔥 Gestión de Incendios Forestales')).toBeVisible();
  });

  test('Muestra el encabezado de añadir incendio forestal', async ({ page }) => {
	// Navegar a la página de incendios forestales
	await page.goto('/forest-fires');
	
	// Esperar a que la página se cargue completamente
	await page.waitForLoadState('networkidle');
	
	// Verificar que el encabezado de añadir incendio forestal está presente
	await expect(
	  page.getByRole('heading', { name: '➕ Añadir nuevo incendio forestal' })
	).toBeVisible();
	
	// Alternativa: usar un selector más genérico
	// await expect(page.getByText('➕ Añadir nuevo incendio forestal')).toBeVisible();
	
	// También podemos verificar que está el formulario asociado
	await expect(page.locator('form:has(button:text("✅ Crear recurso"))')).toBeVisible();
  });

  

// FUNCION QUE COMPRUEBA QUE LA LISTA DE INCENDIOS FORESTALES SE CARGAN CORRECTAMENTE Y QUE EL FILTRADO POR AÑO Y COMUNIDAD FUNCIONA BIEN

test.describe('Listado de incendios forestales', () => {
	const year = 2024;
	const autonomous_community = 'andalucIa'; 
	const listUrl = '/forest-fires';

	test('Carga correctamente la lista de incendios', async ({ page }) => {
		await page.goto(listUrl);
		
		// Esperar a que la página se cargue completamente
		await page.waitForLoadState('networkidle');
	
		// Verificar elementos con los textos exactos que aparecen en la página
		await expect(page.getByRole('heading', { name: '🔥 Gestión de Incendios Forestales' })).toBeVisible();
		await expect(page.getByText('Año')).toBeVisible();
		await expect(page.getByText('Comunidad Autónoma')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
	});
	test('Filtra los incendios por año y comunidad', async ({ page }) => {
		await page.goto(listUrl);
		
		// Cargar datos iniciales primero para asegurar que hay datos
		await page.getByRole('button', { name: '📋 Cargar datos iniciales' }).click();
		await page.waitForTimeout(1000); // Esperar que carguen los datos
		
		// Usa los selectores correctos con los nombres de placeholder exactos
		await page.locator('form:has(button:text("Buscar")) input[placeholder="Desde año"]').fill('2024');
		await page.locator('form:has(button:text("Buscar")) input[placeholder="Comunidad Autónoma"]').fill('andalucia');
		
		// Usar el botón de búsqueda con el nombre correcto
		await page.getByRole('button', { name: 'Buscar' }).click();
		
		// Esperar a que se complete la búsqueda
		await page.waitForTimeout(1000);
		
		// Verificar que aparece el mensaje de resultados correcto
		await expect(page.getByText(/🔍 Se encontraron \d+ resultado/)).toBeVisible({ timeout: 5000 });
		
		// Verificar que hay resultados en la tabla
		const rowCount = await page.locator('table tbody tr').count();
		expect(rowCount).toBeGreaterThan(0);
		
		// Verificar que el resultado filtrado contiene la comunidad buscada
		await expect(page.getByText('andalucia', { exact: false })).toBeVisible();
	  });
});
