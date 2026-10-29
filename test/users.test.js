import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import Users from '../src/model/users.class.js'
import User from '../src/model/user.class.js'
import { server, resetDB, getDB } from './mocks/server.js'

const usersData = [
  { id: 7,  nick: 'Laura',  email: 'laura@x.com',  password: 'abcd' },
  { id: 8,  nick: 'Carlos', email: 'carlos@x.com', password: 'abcd' },
  { id: 9,  nick: 'Marta',  email: 'marta@x.com',  password: 'abcd' },
  { id: 10, nick: 'Sergi',  email: 'sergi@x.com',  password: 'abcd' },
]

const newUserData = () => ({ nick: 'Pau', email: 'pau@x.com', password: '1234' })

let users

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

beforeEach(async () => {
  resetDB({ users: usersData })
  users = new Users()
  await users.populate()
})

describe('Users constructor y populate', () => {
  test('una colección nueva está vacía', () => {
    expect(new Users().data).toEqual([])
  })

  test('populate carga todos los usuarios como instancias de User', () => {
    expect(users.data).toHaveLength(usersData.length)
    users.data.forEach(user => expect(user).toBeInstanceOf(User))
    expect(users.data[0]).toEqual(usersData[0])
  })
})

describe('addUser', () => {
  test('añade el usuario en la BBDD y en data y devuelve el objeto creado', async () => {
    const user = await users.addUser(newUserData())
    expect(user).toBeInstanceOf(User)
    expect(user.id).toBe(11)
    expect(user.nick).toBe('Pau')
    expect(users.data).toHaveLength(usersData.length + 1)
    expect(users.data).toContain(user)
    expect(getDB().users).toHaveLength(usersData.length + 1)
  })

  test('la id la asigna la BBDD', async () => {
    resetDB({ users: [] })
    expect((await new Users().addUser(newUserData())).id).toBe(1)
  })
})

describe('removeUser', () => {
  test('elimina el usuario indicado de la BBDD y de data', async () => {
    await users.removeUser(8)
    expect(users.data).toHaveLength(usersData.length - 1)
    expect(users.data.some(user => user.id === 8)).toBe(false)
    expect(getDB().users.some(user => user.id === 8)).toBe(false)
  })

  test('lanza una excepción si el usuario no existe y no borra nada', async () => {
    await expect(users.removeUser(500)).rejects.toThrow(Error)
    expect(users.data).toHaveLength(usersData.length)
  })
})

describe('changeUser', () => {
  test('modifica el usuario indicado y devuelve el objeto modificado', async () => {
    const changed = await users.changeUser({ ...usersData[1], email: 'nuevo@x.com' })
    expect(changed).toBeInstanceOf(User)
    expect(changed.email).toBe('nuevo@x.com')
    expect((await users.getUserById(8)).email).toBe('nuevo@x.com')
    expect(users.data).toHaveLength(usersData.length)
    expect(getDB().users.find(user => user.id === 8).email).toBe('nuevo@x.com')
  })

  test('lanza una excepción si el usuario no existe', async () => {
    await expect(users.changeUser({ ...usersData[0], id: 500 })).rejects.toThrow(Error)
  })
})

describe('changeUserPassword', () => {
  test('cambia la contraseña en la BBDD y en data', async () => {
    const changed = await users.changeUserPassword(9, 'nueva')
    expect(changed).toBeInstanceOf(User)
    expect(changed.password).toBe('nueva')
    expect((await users.getUserById(9)).password).toBe('nueva')
    expect((await users.getUserById(9)).nick).toBe('Marta')
    expect(getDB().users.find(user => user.id === 9).password).toBe('nueva')
  })

  test('lanza una excepción si el usuario no existe', async () => {
    await expect(users.changeUserPassword(500, 'nueva')).rejects.toThrow(Error)
  })
})

describe('toString', () => {
  test('devuelve una línea por usuario', () => {
    const lines = users.toString().split('\n')
    expect(lines).toHaveLength(usersData.length)
    expect(lines[0]).toContain('Nick: Laura')
  })
})

describe('getUserById', () => {
  test('devuelve el usuario con esa id', async () => {
    expect((await users.getUserById(9)).nick).toBe('Marta')
  })

  test('obtiene el usuario del servidor sin necesitar un populate() previo', async () => {
    const user = await new Users().getUserById(10)
    expect(user).toBeInstanceOf(User)
    expect(user).toEqual(usersData[3])
  })

  test('rechaza la promesa si el usuario no existe', async () => {
    await expect(new Users().getUserById(500)).rejects.toThrow(Error)
  })
})

describe('getUserIndexById', () => {
  test('devuelve la posición del usuario', () => {
    expect(users.getUserIndexById(9)).toBe(2)
  })

  test('lanza una excepción si no existe', () => {
    expect(() => users.getUserIndexById(500)).toThrow(Error)
  })
})

describe('getUserByNickName', () => {
  test('devuelve el usuario con ese nick', () => {
    expect(users.getUserByNickName('Sergi').id).toBe(10)
  })

  test('lanza una excepción si no existe', () => {
    expect(() => users.getUserByNickName('Nadie')).toThrow(Error)
  })
})
