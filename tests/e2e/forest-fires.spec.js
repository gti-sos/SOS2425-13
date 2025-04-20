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

	test('Edita un recurso con datos válidos', async ({ page }) => {
		await page.goto(editUrl);

		await page.locator('input#accidentes').fill('10');
		await page.locator('input#porcentaje').fill('0.2');
		await page.getByRole('button', { name: '💾 Guardar cambios' }).click();

		await expect(page.getByRole('alert')).toHaveText(/✅ Cambios guardados correctamente/);
	});

	test('Muestra error con porcentaje inválido (>1)', async ({ page }) => {
		await page.goto(editUrl);

		await page.locator('input#porcentaje').fill('1.5');
		await page.getByRole('button', { name: '💾 Guardar cambios' }).click();

		await expect(page.getByRole('alert')).toHaveText(/❌ Asegúrate de que los datos son numéricos/);
	});

	test.skip('Elimina el recurso (⚠️ cuidado si estás en producción)', async ({ page }) => {
		await page.goto(editUrl);

		page.once('dialog', dialog => dialog.accept());
		await page.getByRole('button', { name: '🗑️ Eliminar' }).click();

		await expect(page.getByRole('alert')).toHaveText(/Recurso eliminado correctamente/);
	});
});

// FUNCION QUE CREA UN NUEVO REGIATRO DE INCENDIO FORESTAL (HAY QUE ASEGURARSE QUE ESTE RECURSO NO EXISTA EN LA BASE DE DATOS)

test.describe('Crear incendio forestal', () => {
	const year = 2020;
	const community = 'cataluña'; 
	const createUrl = '/forest-fires/create';

	test('Carga la vista de crear correctamente', async ({ page }) => {
		await page.goto(createUrl);

		await expect(page.getByText('✏️ Crear nuevo incendio')).toBeVisible();
		await expect(page.locator('input#accidentes')).toBeVisible();
		await expect(page.locator('input#porcentaje')).toBeVisible();
	});

	test('Crea un nuevo incendio con datos válidos', async ({ page }) => {
		await page.goto(createUrl);

		await page.locator('input#accidentes').fill('20');
		await page.locator('input#porcentaje').fill('0.15');
		await page.getByRole('button', { name: '💾 Crear incendio' }).click();

		await expect(page.getByRole('alert')).toHaveText(/✅ Incendio creado correctamente/);
	});

	test('Muestra error con porcentaje inválido (>1)', async ({ page }) => {
		await page.goto(createUrl);

		await page.locator('input#porcentaje').fill('1.5');
		await page.getByRole('button', { name: '💾 Crear incendio' }).click();

		await expect(page.getByRole('alert')).toHaveText(/❌ Asegúrate de que los datos son numéricos/);
	});
});

// FUNCION QUE COMPRUEBA QUE LA LISTA DE INCENDIOS FORESTALES SE CARGAN CORRECTAMENTE Y QUE EL FILTRADO POR AÑO Y COMUNIDAD FUNCIONA BIEN

test.describe('Listado de incendios forestales', () => {
	const year = 2024;
	const community = 'AndalucIa'; 
	const listUrl = '/forest-fires';

	test('Carga correctamente la lista de incendios', async ({ page }) => {
		await page.goto(listUrl);

		await expect(page.getByText('Incendios forestales')).toBeVisible();
		await expect(page.getByText('Año')).toBeVisible();
		await expect(page.getByText('Comunidad autónoma')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Filtrar' })).toBeVisible();
	});

	test('Filtra los incendios por año y comunidad', async ({ page }) => {
		await page.goto(listUrl);

		await page.locator('input#year').fill('2023');
		await page.locator('input#community').fill('Andalucía');
		await page.getByRole('button', { name: 'Filtrar' }).click();

		await expect(page.getByText(`Incendios en Andalucía ${year}`)).toBeVisible();
	});
});
