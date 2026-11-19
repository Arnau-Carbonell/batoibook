const SERVER = 'http://localhost:3000'

// filters: objeto con los campos por los que filtrar, p.ej. { userId: 4, moduleCode: '5021' }
// hace GET /books?userId=4&moduleCode=5021. json-server devuelve siempre un array
// (vacío si ningún libro cumple los filtros), nunca un 404.
export async function getDBBooks(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${SERVER}/books${query ? '?' + query : ''}`);
    if (!response.ok) {
        throw new Error(`Error ${response.status} al obtener los libros`);
    }
    return await response.json();
}

export async function getDBBook(id) {
    const response = await fetch(`${SERVER}/books/${id}`);
    if (!response.ok) {
        throw new Error(`Error ${response.status} al obtener el libro con id ${id}`);
    }
    return await response.json();
}

export async function addDBBook(book) {
    const response = await fetch(`${SERVER}/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
    });
    if (!response.ok) {
        throw new Error(`Error ${response.status} al añadir el libro`);
    }
    return await response.json();
}

export async function removeDBBook(id) {
    const response = await fetch(`${SERVER}/books/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error(`Error ${response.status} al borrar el libro con id ${id}`);
    }
    return await response.json();
}

export async function changeDBBook(book) {
    const response = await fetch(`${SERVER}/books/${book.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
    });
    if (!response.ok) {
        throw new Error(`Error ${response.status} al modificar el libro con id ${book.id}`);
    }
    return await response.json();
}
