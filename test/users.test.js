import { beforeEach, describe, expect, test } from 'vitest'
import Users from '../src/model/users.class.js'
import User from '../src/model/user.class.js'

const usersData = [
  { id: 7,  nick: 'Laura',  email: 'laura@x.com',  password: 'abcd' },
  { id: 8,  nick: 'Carlos', email: 'carlos@x.com', password: 'abcd' },
  { id: 9,  nick: 'Marta',  email: 'marta@x.com',  password: 'abcd' },
  { id: 10, nick: 'Sergi',  email: 'sergi@x.com',  password: 'abcd' },
]

const newUserData = () => ({ nick: 'Pau', email: 'pau@x.com', password: '1234' })

let users

beforeEach(() => {
  users = new Users()
  users.populate(usersData)
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
  test('añade el usuario y devuelve el objeto creado', () => {
    const user = users.addUser(newUserData())
    expect(user).toBeInstanceOf(User)
    expect(user.id).toBe(11)
    expect(user.nick).toBe('Pau')
    expect(users.data).toHaveLength(usersData.length + 1)
    expect(users.data).toContain(user)
  })

  test('en una colección vacía el primer id es 1', () => {
    expect(new Users().addUser(newUserData()).id).toBe(1)
  })

  test('ignora la id que se le pasa si ya está en uso', () => {
    const user = users.addUser({ ...newUserData(), id: 7 })
    expect(user.id).not.toBe(7)
    expect(users.data.filter(u => u.id === 7)).toHaveLength(1)
  })

  test('nunca genera una id repetida aunque los ids no estén ordenados', () => {
    users.populate([usersData[1], usersData[0]]) // ids 8, 7
    const user = users.addUser(newUserData())
    const ids = users.data.map(u => u.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(user.id).toBe(9)
  })
})

describe('removeUser', () => {
  test('elimina el usuario indicado', () => {
    users.removeUser(8)
    expect(users.data).toHaveLength(usersData.length - 1)
    expect(users.data.some(user => user.id === 8)).toBe(false)
  })

  test('lanza una excepción si el usuario no existe y no borra nada', () => {
    expect(() => users.removeUser(500)).toThrow(Error)
    expect(users.data).toHaveLength(usersData.length)
  })
})

describe('changeUser', () => {
  test('modifica el usuario indicado y devuelve el objeto modificado', () => {
    const changed = users.changeUser({ ...usersData[1], email: 'nuevo@x.com' })
    expect(changed).toBeInstanceOf(User)
    expect(changed.email).toBe('nuevo@x.com')
    expect(users.getUserById(8).email).toBe('nuevo@x.com')
    expect(users.data).toHaveLength(usersData.length)
  })

  test('lanza una excepción si el usuario no existe', () => {
    expect(() => users.changeUser({ ...usersData[0], id: 500 })).toThrow(Error)
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
  test('devuelve el usuario con esa id', () => {
    expect(users.getUserById(9).nick).toBe('Marta')
  })

  test('lanza una excepción si no existe', () => {
    expect(() => users.getUserById(500)).toThrow(Error)
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
