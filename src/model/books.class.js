import Book from './book.class.js';

export default class Books {
    constructor() {
        this.data = [];
    }

    populate(books) {
        this.data = books.map(book => new Book(book));
    }

    addBook(bookData) {
        const id = this.data.length > 0 ? this.data[this.data.length - 1].id + 1 : 1;
        bookData.id = id;
        const book = new Book(bookData);
        this.data.push(book);
        return book;
    }

    removeBook(bookId) {
        const book = this.data.find(book => book.id === bookId);
        if (!book) {
            throw new Error('Libro no encontrado');
        }
        this.data = this.data.filter(book => book.id !== bookId);
    }

    changeBook(bookData) {
        const index = this.data.findIndex(book => book.id === bookData.id);
        if (index === -1) {
            throw new Error(`No existe el libro con id ${bookData.id}`);
        }
        const newBook = new Book(bookData);
        this.data[index] = newBook;
        return newBook;
    }

    toString() {
        return this.data.map(book => `ID: ${book.id}, User ID: ${book.userId}, Module Code: ${book.moduleCode}, Publisher: ${book.publisher}, Price: ${book.price}, Pages: ${book.pages}, Status: ${book.status}, Photos: ${book.photos}, Comments: ${book.comments}, Sold Date: ${book.soldDate}`).join('\n');
    }

}   