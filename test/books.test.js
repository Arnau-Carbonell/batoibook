import { beforeEach, describe, expect, test } from 'vitest'
import Books from '../src/model/books.class.js'
import Book from '../src/model/book.class.js'

// Mismo fixture que en functions.test.js. La diferencia es que ahora los
// datos viven dentro de la instancia: se crea una nueva en cada test
// (beforeEach) para que lo que añade o borra un test no afecte a los demás.
const booksData = [
  { id: 1, userId: 7,  moduleCode: '0373', publisher: 'Apunts', price: 12, pages: 40,  status: 'good', comments: '', soldDate: '' },
  { id: 2, userId: 7,  moduleCode: '0373', publisher: 'Anaya',  price: 28, pages: 180, status: 'new',  comments: '', soldDate: '2024-03-10' },
  { id: 3, userId: 7,  moduleCode: '0485', publisher: 'Apunts', price: 8,  pages: 25,  status: 'bad',  comments: '', soldDate: '' },
  { id: 4, userId: 8,  moduleCode: '0373', publisher: 'Edebé',  price: 30, pages: 250, status: 'good', comments: '', soldDate: '' },
  { id: 5, userId: 9,  moduleCode: '0485', publisher: 'Apunts', price: 14, pages: 15,  status: 'good', comments: '', soldDate: '2024-05-20' },
  { id: 6, userId: 10, moduleCode: '0487', publisher: 'Anaya',  price: 40, pages: 300, status: 'used', comments: '', soldDate: '' },
  { id: 7, userId: 8,  moduleCode: '0487', publisher: 'SM',     price: 23, pages: 120, status: 'new',  comments: '', soldDate: '' },
]

const newBookData = () => ({ userId: 9, moduleCode: '0487', publisher: 'SM', price: 20, pages: 100, status: 'new' })

let books

beforeEach(() => {
  books = new Books()
  books.populate(booksData)
})

describe('Books constructor y populate', () => {
  test('una colección nueva está vacía', () => {
    expect(new Books().data).toEqual([])
  })

  test('populate carga todos los libros como instancias de Book', () => {
    expect(books.data).toHaveLength(booksData.length)
    books.data.forEach(book => expect(book).toBeInstanceOf(Book))
    expect(books.data[0].id).toBe(1)
  })

  test('populate con un array vacío deja la colección vacía', () => {
    books.populate([])
    expect(books.data).toEqual([])
  })
})

describe('addBook', () => {
  test('añade el libro y devuelve el objeto creado', () => {
    const book = books.addBook(newBookData())
    expect(book).toBeInstanceOf(Book)
    expect(book.id).toBe(8)
    expect(book.publisher).toBe('SM')
    expect(books.data).toHaveLength(booksData.length + 1)
    expect(books.data).toContain(book)
  })

  test('en una colección vacía el primer id es 1', () => {
    const empty = new Books()
    expect(empty.addBook(newBookData()).id).toBe(1)
  })

  test('ignora la id que se le pasa si ya está en uso', () => {
    const book = books.addBook({ ...newBookData(), id: 1 })
    expect(book.id).not.toBe(1)
    expect(books.data.filter(b => b.id === 1)).toHaveLength(1)
  })

  test('nunca genera una id repetida aunque los ids no estén ordenados', () => {
    books.populate([
      { ...booksData[0], id: 2 },
      { ...booksData[1], id: 1 },
    ])
    const book = books.addBook(newBookData())
    const ids = books.data.map(b => b.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(book.id).toBe(3)
  })
})

describe('removeBook', () => {
  test('elimina el libro indicado', () => {
    books.removeBook(3)
    expect(books.data).toHaveLength(booksData.length - 1)
    expect(books.data.some(book => book.id === 3)).toBe(false)
  })

  test('lanza una excepción si el libro no existe y no borra nada', () => {
    expect(() => books.removeBook(500)).toThrow(Error)
    expect(books.data).toHaveLength(booksData.length)
  })
})

describe('changeBook', () => {
  test('modifica el libro indicado y devuelve el objeto modificado', () => {
    const changed = books.changeBook({ ...booksData[2], price: 99 })
    expect(changed).toBeInstanceOf(Book)
    expect(changed.price).toBe(99)
    expect(books.getBookById(3).price).toBe(99)
    expect(books.data).toHaveLength(booksData.length)
  })

  test('lanza una excepción si el libro no existe', () => {
    expect(() => books.changeBook({ ...booksData[0], id: 500 })).toThrow(Error)
    expect(books.data).toHaveLength(booksData.length)
  })
})

describe('toString', () => {
  test('devuelve una línea por libro', () => {
    const lines = books.toString().split('\n')
    expect(lines).toHaveLength(booksData.length)
    expect(lines[0]).toContain('ID: 1')
  })

  test('una colección vacía devuelve ""', () => {
    expect(new Books().toString()).toBe('')
  })
})

describe('getBookById', () => {
  test('devuelve el libro con esa id', () => {
    expect(books.getBookById(3).id).toBe(3)
  })

  test('lanza una excepción si no existe', () => {
    expect(() => books.getBookById(500)).toThrow(Error)
  })
})

describe('getBookIndexById', () => {
  test('devuelve la posición del libro', () => {
    expect(books.getBookIndexById(3)).toBe(2)
  })

  test('lanza una excepción si no existe', () => {
    expect(() => books.getBookIndexById(500)).toThrow(Error)
  })
})

describe('bookExists', () => {
  test('true si el usuario tiene un libro de ese módulo', () => {
    expect(books.bookExists(7, '0485')).toBe(true)
  })

  test('false si no lo tiene', () => {
    expect(books.bookExists(7, '0487')).toBe(false)
  })
})

describe('booksFromUser', () => {
  test('devuelve los libros del usuario', () => {
    expect(books.booksFromUser(7).map(b => b.id)).toEqual([1, 2, 3])
  })

  test('devuelve [] si el usuario no tiene libros', () => {
    expect(books.booksFromUser(500)).toEqual([])
  })
})

describe('booksFromModule', () => {
  test('devuelve los libros del módulo', () => {
    expect(books.booksFromModule('0373').map(b => b.id)).toEqual([1, 2, 4])
  })

  test('devuelve [] si el módulo no tiene libros', () => {
    expect(books.booksFromModule('9999')).toEqual([])
  })
})

describe('booksCheeperThan', () => {
  test('incluye los libros con precio igual o menor', () => {
    expect(books.booksCheeperThan(14).map(b => b.id)).toEqual([1, 3, 5])
  })

  test('devuelve [] si ninguno es tan barato', () => {
    expect(books.booksCheeperThan(1)).toEqual([])
  })
})

describe('booksWithStatus', () => {
  test('devuelve los libros con ese estado', () => {
    expect(books.booksWithStatus('new').map(b => b.id)).toEqual([2, 7])
  })

  test('devuelve [] si ningún libro tiene ese estado', () => {
    expect(books.booksWithStatus('roto')).toEqual([])
  })
})

describe('averagePriceOfBooks', () => {
  test('devuelve la media con 2 decimales y €', () => {
    // (12+28+8+30+14+40+23) / 7 = 22.142857...
    expect(books.averagePriceOfBooks()).toBe('22.14 €')
  })

  test('una colección vacía devuelve "0.00 €"', () => {
    expect(new Books().averagePriceOfBooks()).toBe('0.00 €')
  })
})

describe('booksOfTypeNotes', () => {
  test('devuelve los libros de Apunts', () => {
    expect(books.booksOfTypeNotes().map(b => b.id)).toEqual([1, 3, 5])
  })

  test('devuelve [] si no hay apuntes', () => {
    books.populate(booksData.filter(b => b.publisher !== 'Apunts'))
    expect(books.booksOfTypeNotes()).toEqual([])
  })
})

describe('booksNotSold', () => {
  test('devuelve los libros sin fecha de venta', () => {
    expect(books.booksNotSold().map(b => b.id)).toEqual([1, 3, 4, 6, 7])
  })

  test('devuelve [] si todos están vendidos', () => {
    books.populate(booksData.filter(b => b.soldDate !== ''))
    expect(books.booksNotSold()).toEqual([])
  })
})

describe('incrementPriceOfbooks', () => {
  test('devuelve los libros con el precio incrementado', () => {
    const result = books.incrementPriceOfbooks(0.1)
    expect(result).toHaveLength(booksData.length)
    expect(result[0].price).toBeCloseTo(13.2)
    expect(result[5].price).toBeCloseTo(44)
  })

  test('devuelve instancias de Book', () => {
    books.incrementPriceOfbooks(0.1).forEach(book => expect(book).toBeInstanceOf(Book))
  })

  test('no modifica los libros de la colección', () => {
    books.incrementPriceOfbooks(0.1)
    expect(books.getBookById(1).price).toBe(12)
  })
})
