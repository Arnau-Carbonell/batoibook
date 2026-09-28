
export function getBookById(books = [], bookId) {
    const book = books.find(book => book.id === bookId);

    if (book === undefined) {
        throw('no se encuentra el libro')
    }
    return book;
}


export function getBookIndexById(books = [], bookId) {
    const index = books.findIndex(book => book.id === bookId);

    if (index === -1) {
        throw('no se encuentra el libro')
    }

    return index;
}

export function bookExists(books = [], userId, moduleCode) {
    return books.some(book => book.userId === userId && book.moduleCode === moduleCode)
}

export function booksFromUser(books = [], userId) {
    return books.filter(book => book.userId === userId)
}

export function booksFromModule(books = [], moduleCode) {
    return books.filter(book => book.moduleCode === moduleCode)
}

export function booksCheeperThan(books = [], price) {
    return books.filter(book => book.price <= price)
}

export function booksWithStatus(books = [], status) {
    return books.filter(book => book.status === status)
}

export function averagePriceOfBooks(books = []) {
    if (books.length === 0) return '0.00 €'

    const total = books.reduce((suma, book) => suma + book.price, 0)

    return (total / books.length).toFixed(2) + ' €'
}

export function booksOfTypeNotes(books = []) {
    return books.filter(book => book.publisher === "Apunts")
}

export function booksNotSold(books = []) {
    return books.filter(book => book.soldDate === "")
}

export function incrementPriceOfbooks(books, percentage) {
  return books.map(book => ({
    ...book,
    price: book.price * (1 + percentage),
  }));
}

export function getUserById(users = [], number) {

    const user = users.find(user => user.id === number)

    if (user === undefined){
        throw('Usuario no encontrado')
    }

    return user;
}

export function getUserIndexById(users = [], number) {
    const userIndex = users.findIndex(user => user.id === number);

    if (userIndex === -1){
        throw('indice no encontrado');
    }

    return userIndex;
}

export function getUserByNickName(users = [], nick) {
    const user = users.find(user => user.nick === nick)

    if (user === undefined) {
        throw('usuario no encontrad')
    }

    return user;
}

export function getModuleByCode(modules = [], modeuleCode) {
    const module = modules.find(module => module.code === modeuleCode);
    
    if (module === undefined) {
        throw('modulo no encontrado')
    }

    return module;
}

