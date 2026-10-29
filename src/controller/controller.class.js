import Books from '../model/books.class.js';
import Users from '../model/users.class.js';
import Modules from '../model/modules.class.js';
import View from '../view/view.class.js';

export default class Controller {
    constructor() {
        this.model = {
            books: new Books(),
            users: new Users(),
            modules: new Modules(),
        };
        this.view = new View();
    }

    async init() {
        try {
            await Promise.all([
                this.model.users.populate(),
                this.model.modules.populate(),
                this.model.books.populate(),
            ]);
            this.view.renderModulesSelect(this.model.modules.data);
            this.view.renderBooksList(this.model.books.data, this.model.modules.data);
        } catch (error) {
            this.view.showMessage('error', error.message);
        }
        this.view.bindAddBook(this.handleSubmitBook.bind(this));
        this.view.bindRemoveBook(this.handleRemoveBook.bind(this));
    }

    findModule(moduleCode) {
        return this.model.modules.data.find(module => module.code === moduleCode);
    }

    async handleSubmitBook(payload) {
        try {
            if (this.model.books.bookExists(payload.userId, payload.moduleCode)) {
                throw new Error('Ese usuario ya tiene un libro de ese módulo');
            }
            await this.model.books.addBook(payload);
            this.view.renderBooksList(this.model.books.data, this.model.modules.data);
            this.view.resetForm();
            this.view.showMessage('info', 'Libro añadido');
        } catch (error) {
            this.view.showMessage('error', error.message);
        }
    }

    async handleRemoveBook(bookId) {
        try {
            const book = this.model.books.data.find(book => String(book.id) === String(bookId));
            if (!book) {
                throw new Error(`No existe el libro con id ${bookId}`);
            }
            await this.model.books.removeBook(book.id);
            this.view.renderBooksList(this.model.books.data, this.model.modules.data);
            this.view.showMessage('info', 'Libro eliminado');
        } catch (error) {
            this.view.showMessage('error', error.message);
        }
    }
}
