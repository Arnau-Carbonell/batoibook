import Books from '../model/books.class.js';
import Users from '../model/users.class.js';
import Modules from '../model/modules.class.js';
import Cart from '../model/cart.class.js';
import View from '../view/view.class.js';
import Router from '../services/router.js';

// Suponemos que ya nos hemos autenticado y somos el usuario 2
const CURRENT_USER_ID = 2;
const REPEATED_MODULE_MESSAGE = 'Ya tienes un libro de este módulo a la venta';

export default class Controller {
    constructor() {
        this.model = {
            books: new Books(),
            users: new Users(),
            modules: new Modules(),
            cart: new Cart(),
        };
        this.view = new View();
        this.router = new Router(this.view);
    }

    async init() {
        this.view.bindSubmitBook(this.handleSubmitBook.bind(this));
        this.view.bindModuleChange(this.handleModuleChange.bind(this));
        this.view.bindAddToCart(this.handleAddToCart.bind(this));
        this.view.bindEditBook(this.handleEditBook.bind(this));
        this.view.bindRemoveBook(this.handleRemoveBook.bind(this));
        this.router.init();

        try {
            await Promise.all([
                this.model.users.populate(),
                this.model.modules.populate(),
                this.model.books.populate(),
                this.model.cart.populate(),
            ]);
            this.view.renderModulesSelect(this.model.modules.data);
            this.view.renderBooksList(this.model.books.data, this.model.modules.data);
        } catch (error) {
            this.view.showMessage('error', error.message);
        }
    }

    findModule(moduleCode) {
        return this.model.modules.data.find(module => module.code === moduleCode);
    }

    // Las ids que llegan de la vista son texto: buscamos el libro para usar su id real
    findBook(bookId) {
        const book = this.model.books.data.find(book => String(book.id) === String(bookId));
        if (!book) {
            throw new Error(`No existe el libro con id ${bookId}`);
        }
        return book;
    }

    // ¿El usuario ya tiene otro libro de ese módulo? bookId es el libro que se
    // está editando ('' o undefined si se añade uno nuevo).
    async isModuleRepeated(moduleCode, bookId) {
        if (!bookId) {
            return this.model.books.bookExists(CURRENT_USER_ID, moduleCode);
        }
        const book = this.findBook(bookId);
        // Si deja el módulo que ya tenía, el libro que encontraría el servidor es él mismo
        if (book.moduleCode === moduleCode) {
            return false;
        }
        return this.model.books.bookExists(book.userId, moduleCode);
    }

    async handleModuleChange(moduleCode, bookId) {
        try {
            if (await this.isModuleRepeated(moduleCode, bookId)) {
                this.view.setModuleError(moduleCode, bookId, REPEATED_MODULE_MESSAGE);
            } else {
                this.view.clearModuleError(moduleCode, bookId);
            }
        } catch (error) {
            // No sabemos si está repetido: no lo marcamos (lo volveremos a comprobar al guardar)
            this.view.showMessage('error', `No se ha podido comprobar el módulo: ${error.message}`);
        }
    }

    async handleSubmitBook(payload) {
        const { id, ...bookData } = payload;
        try {
            // Se vuelve a comprobar al guardar: el usuario puede haber enviado antes
            // de que llegara la respuesta de la comprobación hecha al cambiar el módulo
            if (await this.isModuleRepeated(bookData.moduleCode, id)) {
                this.view.setModuleError(bookData.moduleCode, id, REPEATED_MODULE_MESSAGE);
                throw new Error(REPEATED_MODULE_MESSAGE);
            }
            if (id) {
                const book = this.findBook(id);
                const updatedBook = await this.model.books.changeBook({ ...bookData, id: book.id, userId: book.userId });
                this.view.renderUpdatedBook(updatedBook, this.findModule(updatedBook.moduleCode));
                this.view.resetForm();
                this.view.showMessage('info', 'Libro modificado');
            } else {
                const newBook = await this.model.books.addBook({ ...bookData, userId: CURRENT_USER_ID });
                this.view.renderBook(newBook, this.findModule(newBook.moduleCode));
                this.view.resetForm();
                this.view.showMessage('info', 'Libro añadido');
            }
        } catch (error) {
            this.view.showMessage('error', error.message);
        }
    }

    handleAddToCart(bookId) {
        try {
            const book = this.findBook(bookId);
            this.model.cart.addItem(book);
            this.view.showMessage('info', `Libro ${book.id} añadido al carrito`);
        } catch (error) {
            this.view.showMessage('error', error.message);
        }
    }

    handleEditBook(bookId) {
        try {
            const book = this.findBook(bookId);
            this.view.renderEditForm(book);
            window.location.hash = 'edit';
        } catch (error) {
            this.view.showMessage('error', error.message);
        }
    }

    async handleRemoveBook(bookId) {
        try {
            const book = this.findBook(bookId);
            await this.model.books.removeBook(book.id);
            if (this.model.cart.getBookById(book.id).id !== undefined) {
                this.model.cart.removeItem(book.id);
            }
            this.view.removeBook(book.id);
            this.view.showMessage('info', `Libro ${book.id} eliminado`);
        } catch (error) {
            this.view.showMessage('error', error.message);
        }
    }
}
