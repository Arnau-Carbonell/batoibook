const SERVER = 'http://localhost:3000'

export async function getDBModules() {
    const response = await fetch(`${SERVER}/modules`);
    if (!response.ok) {
        throw new Error(`Error ${response.status} al obtener los módulos`);
    }
    return await response.json();
}
