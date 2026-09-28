import data from './src/services/datos.js'
import {
    booksFromUser,
    booksFromModule,
    booksWithStatus,
    incrementPriceOfbooks,
} from './src/functions.js'

const { books } = data

// Todos los libros del usuario 4
console.log('Libros del usuario 4:', booksFromUser(books, 4))

// Todos los libros del módulo 5021 que están en buen estado
console.log(
    'Libros del módulo 5021 en buen estado:',
    booksWithStatus(booksFromModule(books, '5021'), 'good')
)

// Incrementar un 10% el precio de los libros
console.log('Libros con el precio incrementado un 10%:', incrementPriceOfbooks(books, 0.1))
