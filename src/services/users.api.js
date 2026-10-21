const SERVER = 'http://localhost:3000'

export async function getDBUsers() {
    const response = await fetch(`${SERVER}/users`);
    if (!response.ok) {
        throw new Error(`Error ${response.status} al obtener los usuarios`);
    }
    return await response.json();
}

export async function getDBUser(id) {
    const response = await fetch(`${SERVER}/users/${id}`);
    if (!response.ok) {
        throw new Error(`Error ${response.status} al obtener el usuario con id ${id}`);
    }
    return await response.json();
}

export async function addDBUser(user) {
    const response = await fetch(`${SERVER}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });
    if (!response.ok) {
        throw new Error(`Error ${response.status} al añadir el usuario`);
    }
    return await response.json();
}

export async function removeDBUser(id) {
    const response = await fetch(`${SERVER}/users/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error(`Error ${response.status} al borrar el usuario con id ${id}`);
    }
    return await response.json();
}

export async function changeDBUser(user) {
    const response = await fetch(`${SERVER}/users/${user.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });
    if (!response.ok) {
        throw new Error(`Error ${response.status} al modificar el usuario con id ${user.id}`);
    }
    return await response.json();
}

export async function changeDBUserPassword(userId, newPassword) {
    const response = await fetch(`${SERVER}/users/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
    });
    if (!response.ok) {
        throw new Error(`Error ${response.status} al cambiar la contraseña del usuario con id ${userId}`);
    }
    return await response.json();
}
