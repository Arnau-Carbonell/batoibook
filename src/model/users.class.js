import User from './user.class.js';

export default class Users {
    constructor() {
        this.data = [];
    }

    populate(users) {
        this.data = users.map(user => new User(user.id, user.nick, user.email, user.password));
    }

    addUser(user) {
        const id = this.data.length > 0 ? this.data[this.data.length - 1].id + 1 : 1;
        user.id = id;
        const user = new User(user.id, user.nick, user.email, user.password);
        this.data.push(user);
        return user;
    }

    removeUser(userId) {
        const user = this.data.find(user => user.id === userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        this.data = this.data.filter(user => user.id !== userId);
    }

    changeUser(userData) {
        const index = this.data.findIndex(user => user.id === userData.id);
        if (index === -1) {
            throw new Error(`No existe el usuario con id ${userData.id}`);
        }
        const newUser = new User(userData.id, userData.nick, userData.email, userData.password);
        this.data[index] = newUser;
        return newUser;
    }

    toString() {
        return this.data.map(user => `ID: ${user.id}, Nick: ${user.nick}, Email: ${user.email}, Password: ${user.password}`).join('\n');
    }
}