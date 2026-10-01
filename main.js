import data from './src/services/datos.js'
import Books from './src/model/books.class.js'
import Users from './src/model/users.class.js'
import Modules from './src/model/modules.class.js'

const books = new Books()
const users = new Users()
const modules = new Modules()

books.populate(data.books)
users.populate(data.users)
modules.populate(data.modules)

// Todos los libros del módulo 5021
console.log('Libros del módulo 5021:', books.booksFromModule('5021'))

// Libros con estado "new"
console.log('Libros nuevos:', books.booksWithStatus('new'))

// Incrementar un 10% el precio de los libros
console.log('Libros con el precio incrementado un 10%:', books.incrementPriceOfbooks(0.1))
