const SERVER = 'http://localhost:3000'

export async function getDBBooks() {
    const response = await fetch(`${SERVER}/books`);
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
