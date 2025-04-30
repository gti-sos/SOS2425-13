import { messageStore } from './stores/messageStore';

export interface Datos {
    year: number;
    autonomous_community: string;
    amount: number;
    benefited_population: number;
    project_count: number;
}

export function mostrarMensaje(texto: string, tipo: string = 'info') {
    messageStore.set({ message: texto, type: tipo });
    setTimeout(() => messageStore.set(null), 4000);
}

export function normalizeCommunity(input: string): string {
    return input
        .toLowerCase()
        .normalize("NFD")
        .replace(/[,]/g, '')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function formatCommunity(input: string): string {
    const map: Record<string, string> = {
        "andalucia": "Andalucía",
        "aragon": "Aragón",
        "asturias": "Asturias",
        "baleares": "Baleares",
        "canarias": "Canarias",
        "cantabria": "Cantabria",
        "castilla-la mancha": "Castilla-La Mancha",
        "castilla y leon": "Castilla y León",
        "catalunya": "Cataluña",
        "ceuta": "Ceuta",
        "comunidad valenciana": "Comunidad Valenciana",
        "extremadura": "Extremadura",
        "galicia": "Galicia",
        "la rioja": "La Rioja",
        "madrid": "Madrid",
        "melilla": "Melilla",
        "murcia": "Murcia",
        "navarra": "Navarra",
        "pais vasco": "País Vasco"
    };
    const normalized = normalizeCommunity(input);
    return map[normalized] || input.charAt(0).toUpperCase() + input.slice(1);
}

export async function obtenerDatos(API: string, query: string): Promise<Datos[]> {
    const url = API + query;
    console.log('Obteniendo datos de:', url);
    try {
        const res = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Respuesta del servidor:', res.status, res.statusText);
        
        if (!res.ok) {
            if (res.status === 404) {
                mostrarMensaje('⚠️ No hay datos disponibles', 'warning');
                return [];
            }
            throw new Error(`Error al obtener datos: ${res.status} ${res.statusText}`);
        }
        
        const datosRecibidos = await res.json();
        console.log('Datos recibidos:', datosRecibidos);
        
        if (!Array.isArray(datosRecibidos)) {
            console.error('Formato de datos inválido:', datosRecibidos);
            throw new Error('Formato de datos inválido');
        }
        
        const datos = datosRecibidos.map((d: Datos) => ({
            ...d,
            autonomous_community: formatCommunity(d.autonomous_community)
        }));
        
        if (datos.length === 0) {
            mostrarMensaje('⚠️ No se encontraron datos que coincidan con los filtros', 'warning');
        } else {
            console.log('Datos procesados:', datos);
        }
        
        return datos;
    } catch (err) {
        console.error('Error en obtenerDatos:', err);
        mostrarMensaje(err instanceof Error ? err.message : 'Error desconocido', 'danger');
        return [];
    }
}

export async function cargarIniciales(API: string) {
    const url = API + '/loadInitialData';
    console.log('Cargando datos iniciales desde:', url);
    try {
        const res = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Respuesta del servidor:', res.status, res.statusText);
        
        let data;
        try {
            data = await res.json();
            console.log('Datos de respuesta:', data);
        } catch (e) {
            console.error('Error al parsear respuesta:', e);
            data = null;
        }
        
        if (res.ok) {
            mostrarMensaje('✅ Datos iniciales cargados correctamente', 'success');
            return true;
        } else if (res.status === 405 || res.status === 409) {
            mostrarMensaje('⚠️ Ya existen datos en la base de datos', 'warning');
            return true;
        } else if (res.status >= 500) {
            console.error('Error del servidor:', res.status, data);
            mostrarMensaje('❌ Error del servidor al cargar los datos', 'danger');
            return false;
        } else {
            console.error('Error desconocido:', res.status, data);
            mostrarMensaje(data?.error || '❌ Error al cargar los datos iniciales', 'danger');
            return false;
        }
    } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        mostrarMensaje('❌ Error de conexión con el servidor', 'danger');
        return false;
    }
}

export async function crear(API: string, datos: Datos) {
    try {
        const res = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        if (res.status === 201) {
            mostrarMensaje('✅ Recurso creado', 'success');
            return true;
        } else if (res.status === 409) {
            mostrarMensaje('⚠️ Recurso ya existe', 'warning');
            return false;
        } else if (res.status === 400) {
            mostrarMensaje('⚠️ Campos incompletos', 'warning');
            return false;
        } else {
            const err = await res.json();
            throw new Error(err.error);
        }
    } catch (e) {
        mostrarMensaje(e instanceof Error ? e.message : 'Error al crear', 'danger');
        return false;
    }
}

export async function actualizarRecurso(API: string, datos: Datos) {
    try {
        const res = await fetch(
            `${API}/${datos.year}/${encodeURIComponent(datos.autonomous_community)}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            }
        );
        if (res.ok) {
            mostrarMensaje('✅ Recurso actualizado', 'success');
            return true;
        } else if (res.status === 409) {
            mostrarMensaje('⚠️ Conflicto de datos', 'warning');
            return false;
        } else if (res.status === 400) {
            mostrarMensaje('⚠️ Datos inválidos', 'warning');
            return false;
        } else {
            throw new Error();
        }
    } catch {
        mostrarMensaje('Error al actualizar', 'danger');
        return false;
    }
}

export async function eliminarRecurso(API: string, datos: Datos) {
    try {
        const res = await fetch(`${API}/${datos.year}/${encodeURIComponent(datos.autonomous_community)}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            mostrarMensaje('🗑️ Recurso eliminado', 'success');
            return true;
        } else {
            const err = await res.json();
            throw new Error(err.error);
        }
    } catch (e) {
        mostrarMensaje(e instanceof Error ? e.message : 'Error al eliminar', 'danger');
        return false;
    }
}

export async function eliminarTodo(API: string) {
    try {
        const res = await fetch(API, { method: 'DELETE' });
        if (res.ok) {
            mostrarMensaje('✅ Todos los datos han sido eliminados', 'success');
            return true;
        } else {
            const err = await res.json();
            throw new Error(err.error);
        }
    } catch (e) {
        mostrarMensaje(e instanceof Error ? e.message : 'Error al eliminar', 'danger');
        return false;
    }
} 