import User from './user.class.js';

export default class Users {
    constructor() {
        this.data = [];
    }

    populate(users) {
        this.data = users.map(user => new User(user.id, user.nick, user.email, user.password));
    }

    addUser(userData) {
        const id = this.data.reduce((max, user) => Math.max(max, user.id), 0) + 1;
        const user = new User(id, userData.nick, userData.email, userData.password);
        this.data.push(user);
        return user;
    }

    removeUser(userId) {
        const user = this.data.find(user => user.id === userId);
        if (!user) {
            throw new Error(`No existe el usuario con id ${userId}`);
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

    getUserById(number) {

        const user = this.data.find(user => user.id === number)

        if (user === undefined) {
            throw new Error(`No existe el usuario con id ${number}`)
        }

        return user;
    }

    getUserIndexById(number) {
        const userIndex = this.data.findIndex(user => user.id === number);

        if (userIndex === -1) {
            throw new Error(`No existe el usuario con id ${number}`);
        }

        return userIndex;
    }

    getUserByNickName(nick) {
        const user = this.data.find(user => user.nick === nick)

        if (user === undefined) {
            throw new Error(`No existe el usuario con nick ${nick}`)
        }

        return user;
    }
}