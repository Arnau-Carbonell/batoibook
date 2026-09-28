import data from './src/services/datos.js'
import {
    getBookById,
    getBookIndexById,
    bookExists,
    booksFromUser,
    booksFromModule,
    booksCheeperThan,
    booksWithStatus,
    averagePriceOfBooks,
    booksOfTypeNotes,
    booksNotSold,
    incrementPriceOfbooks,
    getUserById,
    getUserIndexById,
    getUserByNickName,
    getModuleByCode,
} from './src/functions.js'

const { books, users, modules } = data

function mostrar(titulo, funcion) {
    try {
        console.log(titulo, funcion())
    } catch (error) {
        console.error(titulo, error)
    }
}

// Libros
mostrar('getBookById(6):', () => getBookById(books, 6))
mostrar('getBookById(99):', () => getBookById(books, 99))
mostrar('getBookIndexById(7):', () => getBookIndexById(books, 7))
mostrar('getBookIndexById(99):', () => getBookIndexById(books, 99))
mostrar('bookExists(4, "5025"):', () => bookExists(books, 4, '5025'))
mostrar('bookExists(2, "5021"):', () => bookExists(books, 2, '5021'))
mostrar('booksFromUser(4):', () => booksFromUser(books, 4))
mostrar('booksFromModule("5021"):', () => booksFromModule(books, '5021'))
mostrar('booksCheeperThan(20):', () => booksCheeperThan(books, 20))
mostrar('booksWithStatus("good"):', () => booksWithStatus(books, 'good'))
mostrar('averagePriceOfBooks():', () => averagePriceOfBooks(books))
mostrar('booksOfTypeNotes():', () => booksOfTypeNotes(books))
mostrar('booksNotSold():', () => booksNotSold(books))
mostrar('incrementPriceOfbooks(0.1):', () => incrementPriceOfbooks(books, 0.1))

// Usuarios
mostrar('getUserById(3):', () => getUserById(users, 3))
mostrar('getUserById(99):', () => getUserById(users, 99))
mostrar('getUserIndexById(4):', () => getUserIndexById(users, 4))
mostrar('getUserIndexById(99):', () => getUserIndexById(users, 99))
mostrar('getUserByNickName("Marta"):', () => getUserByNickName(users, 'Marta'))
mostrar('getUserByNickName("Nadie"):', () => getUserByNickName(users, 'Nadie'))

// Módulos
mostrar('getModuleByCode("0612"):', () => getModuleByCode(modules, '0612'))
mostrar('getModuleByCode("XXXX"):', () => getModuleByCode(modules, 'XXXX'))
