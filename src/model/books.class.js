import Book from './book.class.js';
import { getDBBooks, addDBBook, removeDBBook, changeDBBook } from '../services/books.api.js';

export default class Books {
    constructor() {
        this.data = [];
    }

    async populate() {
        const booksData = await getDBBooks();
        this.data = booksData.map(bookData => new Book(bookData));
    }

    async addBook(bookData) {
        const newBook = new Book(await addDBBook(bookData));
        this.data.push(newBook);
        return newBook;
    }

    async removeBook(bookId) {
        await removeDBBook(bookId);
        this.data = this.data.filter(book => book.id !== bookId);
    }

    async changeBook(bookData) {
        const updatedBook = new Book(await changeDBBook(bookData));
        const index = this.getBookIndexById(bookData.id);
        this.data[index] = updatedBook;
        return updatedBook;
    }

    toString() {
        return this.data.map(book => `ID: ${book.id}, User ID: ${book.userId}, Module Code: ${book.moduleCode}, Publisher: ${book.publisher}, Price: ${book.price}, Pages: ${book.pages}, Status: ${book.status}, Photos: ${book.photos}, Comments: ${book.comments}, Sold Date: ${book.soldDate}`).join('\n');
    }

    getBookById(bookId) {
        const book = this.data.find(book => book.id === bookId);

        if (book === undefined) {
            throw new Error(`No existe el libro con id ${bookId}`)
        }
        return book;
    }


    getBookIndexById(bookId) {
        const index = this.data.findIndex(book => book.id === bookId);

        if (index === -1) {
            throw new Error(`No existe el libro con id ${bookId}`)
        }

        return index;
    }

    bookExists(userId, moduleCode) {
        return this.data.some(book => book.userId === userId && book.moduleCode === moduleCode)
    }

    booksFromUser(userId) {
        return this.data.filter(book => book.userId === userId)
    }

    booksFromModule(moduleCode) {
        return this.data.filter(book => book.moduleCode === moduleCode)
    }

    booksCheeperThan(price) {
        return this.data.filter(book => book.price <= price)
    }

    booksWithStatus(status) {
        return this.data.filter(book => book.status === status)
    }
    averagePriceOfBooks() {
        if (this.data.length === 0) return '0.00 €'

        const total = this.data.reduce((suma, book) => suma + book.price, 0)

        return (total / this.data.length).toFixed(2) + ' €'
    }

    booksOfTypeNotes() {
        return this.data.filter(book => book.publisher === "Apunts")
    }

    booksNotSold() {
        return this.data.filter(book => book.soldDate === "")
    }
}   