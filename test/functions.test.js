import { describe, expect, test } from 'vitest'
import * as functions from '../src/functions'

const NOTE_TYPE = 'Apunts'

// Fixture propio, pequeño y diseñado a propósito para cubrir los casos
// límite que nos interesan. No depende de datos.js: si el dataset de la
// asignatura cambia en el futuro, esta batería sigue funcionando igual.
const books = [
  { id: 1, userId: 7,  moduleCode: '0373', publisher: 'Apunts', price: 12, pages: 40,  status: 'good', photo: '', comments: '', soldDate: '' },
  { id: 2, userId: 7,  moduleCode: '0373', publisher: 'Anaya',  price: 28, pages: 180, status: 'new',  photo: '', comments: '', soldDate: '2024-03-10' },
  { id: 3, userId: 7,  moduleCode: '0485', publisher: 'Apunts', price: 8,  pages: 25,  status: 'bad',  photo: '', comments: '', soldDate: '' },
  { id: 4, userId: 8,  moduleCode: '0373', publisher: 'Edebé',  price: 30, pages: 250, status: 'good', photo: '', comments: '', soldDate: '' },
  { id: 5, userId: 9,  moduleCode: '0485', publisher: 'Apunts', price: 14, pages: 15,  status: 'good', photo: '', comments: '', soldDate: '2024-05-20' },
  { id: 6, userId: 10, moduleCode: '0487', publisher: 'Anaya',  price: 40, pages: 300, status: 'used', photo: '', comments: '', soldDate: '' },
  { id: 7, userId: 8,  moduleCode: '0487', publisher: 'SM',     price: 23, pages: 120, status: 'new',  photo: '', comments: '', soldDate: '' },
]

const users = [
  { id: 7,  nick: 'Laura',  email: 'laura@x.com',  password: 'abcd' },
  { id: 8,  nick: 'Carlos', email: 'carlos@x.com', password: 'abcd' },
  { id: 9,  nick: 'Marta',  email: 'marta@x.com',  password: 'abcd' },
  { id: 10, nick: 'Sergi',  email: 'sergi@x.com',  password: 'abcd' },
]

const modules = [
  { code: '0373', cliteral: 'Módulo X', vliteral: 'Mòdul X', courseId: '41' },
  { code: '0485', cliteral: 'Módulo Y', vliteral: 'Mòdul Y', courseId: '41' },
]

describe('function getBookById', () => {
  test('getBookById 3 devuelve el libro con id 3', () => {
    const response = functions.getBookById(books, 3)
    expect(response.id).toBe(3)
  });

  test('getBookById 500 devuelve un error', () => {
    expect(() => functions.getBookById(books, 500)).toThrow()
  });
})

describe('function getBookIndexById', () => {
  test('getBookIndexById 3 devuelve el índice 2', () => {
    const response = functions.getBookIndexById(books, 3)
    expect(response).toBe(2)
  });

  test('getBookIndexById 500 devuelve un error', () => {
    expect(() => functions.getBookIndexById(books, 500)).toThrow()
  });
})

describe('function bookExists', () => {
  test('bookExists userId 7 moduleCode 0373 devuelve true', () => {
    expect(functions.bookExists(books, 7, '0373')).toBe(true)
  });

  test('bookExists userId 50 moduleCode 0373 devuelve false', () => {
    expect(functions.bookExists(books, 50, '0373')).toBe(false)
  });

  test('bookExists userId 7 moduleCode 0487 devuelve false', () => {
    expect(functions.bookExists(books, 7, '0487')).toBe(false)
  });
})

describe('function booksFromUser', () => {
  test('booksFromUser 7 devuelve 3 libros, todos del usuario 7', () => {
    const response = functions.booksFromUser(books, 7)
    expect(response.length).toBe(3)
    for (let book of response) expect(book.userId).toBe(7)
  });

  test('booksFromUser 8 devuelve 2 libros', () => {
    expect(functions.booksFromUser(books, 8).length).toBe(2)
  });

  test('booksFromUser 500 devuelve 0 libros', () => {
    expect(functions.booksFromUser(books, 500).length).toBe(0)
  });
})

describe('function booksFromModule', () => {
  test('booksFromModule 0373 devuelve 3 libros, todos del módulo 0373', () => {
    const response = functions.booksFromModule(books, '0373')
    expect(response.length).toBe(3)
    for (let book of response) expect(book.moduleCode).toBe('0373')
  });

  test('booksFromModule 0487 devuelve 2 libros', () => {
    expect(functions.booksFromModule(books, '0487').length).toBe(2)
  });

  test('booksFromModule 1111 devuelve 0 libros', () => {
    expect(functions.booksFromModule(books, '1111').length).toBe(0)
  });
})

describe('function booksCheeperThan', () => {
  test('booksCheeperThan 35 devuelve 6 libros (excluye el de 40)', () => {
    const response = functions.booksCheeperThan(books, 35)
    expect(response.length).toBe(6)
    for (let book of response) expect(book.price).toBeLessThanOrEqual(35)
  });

  test('booksCheeperThan con precio exacto (30) lo incluye — comprueba el límite <=', () => {
    const response = functions.booksCheeperThan(books, 30)
    expect(response.some(b => b.price === 30)).toBe(true)
  });

  test('booksCheeperThan 5 devuelve 0 libros', () => {
    expect(functions.booksCheeperThan(books, 5).length).toBe(0)
  });
})

describe('function booksWithStatus', () => {
  test('booksWithStatus good devuelve 3 libros', () => {
    const response = functions.booksWithStatus(books, 'good')
    expect(response.length).toBe(3)
    for (let book of response) expect(book.status).toBe('good')
  });

  test('booksWithStatus new devuelve 2 libros', () => {
    const response = functions.booksWithStatus(books, 'new')
    expect(response.length).toBe(2)
    for (let book of response) expect(book.status).toBe('new')
  });

  test('booksWithStatus roto devuelve 0 libros', () => {
    expect(functions.booksWithStatus(books, 'roto').length).toBe(0)
  });
})

describe('function averagePriceOfBooks', () => {
  test('averagePriceOfBooks devuelve 22.14 €', () => {
    // (12+28+8+30+14+40+23) / 7 = 155 / 7 = 22.142857... -> 22.14
    expect(functions.averagePriceOfBooks(books)).toBe('22.14 €')
  });

  test('averagePriceOfBooks de un array vacío devuelve 0.00 €', () => {
    expect(functions.averagePriceOfBooks([])).toBe('0.00 €')
  });
})

describe('function booksOfTypeNotes', () => {
  test('booksOfTypeNotes devuelve 3 libros, todos "Apunts"', () => {
    const response = functions.booksOfTypeNotes(books)
    expect(response.length).toBe(3)
    for (let book of response) expect(book.publisher).toBe(NOTE_TYPE)
  });

  test('booksOfTypeNotes de un array vacío devuelve 0 libros', () => {
    expect(functions.booksOfTypeNotes([]).length).toBe(0)
  });
})

describe('function booksNotSold', () => {
  test('booksNotSold devuelve 5 libros, todos con soldDate vacío', () => {
    const response = functions.booksNotSold(books)
    expect(response.length).toBe(5)
    for (let book of response) expect(book.soldDate).toBe('')
  });

  test('booksNotSold de un array vacío devuelve 0 libros', () => {
    expect(functions.booksNotSold([]).length).toBe(0)
  });
})

describe('function incrementPriceOfbooks', () => {
  test('incrementPriceOfbooks 0.2 sube los precios un 20%', () => {
    const response = functions.incrementPriceOfbooks(books, 0.2)
    expect(response[0].price).toBeCloseTo(14.4)   // 12 * 1.2
    expect(response[3].price).toBeCloseTo(36.0)   // 30 * 1.2
    expect(response[6].price).toBeCloseTo(27.6)   // 23 * 1.2
  });

  test('incrementPriceOfbooks de un array vacío devuelve un array vacío', () => {
    expect(functions.incrementPriceOfbooks([], 0.2).length).toBe(0)
  });

  test('incrementPriceOfbooks no modifica el array original', () => {
    const preciosOriginales = books.map(b => b.price)
    functions.incrementPriceOfbooks(books, 0.2)
    expect(books.map(b => b.price)).toEqual(preciosOriginales)
  });
})

describe('function getUserById', () => {
  test('getUserById 8 devuelve el usuario con id 8', () => {
    expect(functions.getUserById(users, 8).id).toBe(8)
  });

  test('getUserById 500 devuelve un error', () => {
    expect(() => functions.getUserById(users, 500)).toThrow()
  });
})

describe('function getUserIndexById', () => {
  test('getUserIndexById 9 devuelve el índice 2', () => {
    expect(functions.getUserIndexById(users, 9)).toBe(2)
  });

  test('getUserIndexById 500 devuelve un error', () => {
    expect(() => functions.getUserIndexById(users, 500)).toThrow()
  });
})

describe('function getUserByNickName', () => {
  test('getUserByNickName "Marta" devuelve el usuario con nick "Marta"', () => {
    expect(functions.getUserByNickName(users, 'Marta').nick).toBe('Marta')
  });

  test('getUserByNickName "noexiste" devuelve un error', () => {
    expect(() => functions.getUserByNickName(users, 'noexiste')).toThrow()
  });
})

describe('function getModuleByCode', () => {
  test('getModuleByCode "0485" devuelve el módulo con code "0485"', () => {
    expect(functions.getModuleByCode(modules, '0485').code).toBe('0485')
  });

  test('getModuleByCode "1111" devuelve un error', () => {
    expect(() => functions.getModuleByCode(modules, '1111')).toThrow()
  });
})