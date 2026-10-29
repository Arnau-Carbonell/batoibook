import User from './user.class.js';
import { getDBUsers, getDBUser, addDBUser, removeDBUser, changeDBUser, changeDBUserPassword } from '../services/users.api.js';

export default class Users {
    constructor() {
        this.data = [];
    }

    async populate() {
        const users = await getDBUsers();
        this.data = users.map(user => new User(user.id, user.nick, user.email, user.password));
    }

    async addUser(userData) {
        const user = await addDBUser(userData);
        const newUser = new User(user.id, user.nick, user.email, user.password);
        this.data.push(newUser);
        return newUser;
    }

    async removeUser(userId) {
        await removeDBUser(userId);
        this.data = this.data.filter(user => user.id !== userId);
    }

    async changeUser(userData) {
        const user = await changeDBUser(userData);
        const updatedUser = new User(user.id, user.nick, user.email, user.password);
        const index = this.getUserIndexById(userData.id);
        this.data[index] = updatedUser;
        return updatedUser;
    }

    toString() {
        return this.data.map(user => `ID: ${user.id}, Nick: ${user.nick}, Email: ${user.email}, Password: ${user.password}`).join('\n');
    }

    async getUserById(number) {
        const user = await getDBUser(number);
        return new User(user.id, user.nick, user.email, user.password);
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

    async changeUserPassword(userId, newPassword) {
        const user = await changeDBUserPassword(userId, newPassword);
        const updatedUser = new User(user.id, user.nick, user.email, user.password);
        const index = this.getUserIndexById(userId);
        this.data[index] = updatedUser;
        return updatedUser;
    }
}