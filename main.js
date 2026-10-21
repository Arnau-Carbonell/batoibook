import Books from './src/model/books.class.js'
import Users from './src/model/users.class.js'
import Modules from './src/model/modules.class.js'

const books = new Books()
const users = new Users()
const modules = new Modules()

await Promise.all([books.populate(), users.populate(), modules.populate()])

// Todos los libros del módulo 5021
console.log('Libros del módulo 5021:', books.booksFromModule('5021'))

// Libros con estado "new"
console.log('Libros nuevos:', books.booksWithStatus('new'))
