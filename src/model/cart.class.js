import Book from './book.class.js';

export default class Cart {
    constructor() {
        this.data = [];
    }

    populate() {
        // De momento el carrito no se guarda en ningún sitio
    }

    getBookById(bookId) {
        return this.data.find(book => book.id === bookId) ?? {};
    }

    addItem(book) {
        if (this.data.some(item => item.id === book.id)) {
            throw new Error(`El libro con id ${book.id} ya está en el carrito`);
        }
        const copy = new Book({ ...book });
        this.data.push(copy);
        return copy;
    }

    removeItem(bookId) {
        if (!this.data.some(book => book.id === bookId)) {
            throw new Error(`El libro con id ${bookId} no está en el carrito`);
        }
        this.data = this.data.filter(book => book.id !== bookId);
    }

    toString() {
        return this.data.map(book => `ID: ${book.id}, Module Code: ${book.moduleCode}, Publisher: ${book.publisher}, Price: ${book.price}`).join('\n');
    }
}
