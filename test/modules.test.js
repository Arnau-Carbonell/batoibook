import { beforeEach, describe, expect, test } from 'vitest'
import Modules from '../src/model/modules.class.js'
import Module from '../src/model/module.class.js'

const modulesData = [
  { code: '0373', cliteral: 'Módulo X', vliteral: 'Mòdul X', courseId: '41' },
  { code: '0485', cliteral: 'Módulo Y', vliteral: 'Mòdul Y', courseId: '41' },
]

let modules

beforeEach(() => {
  modules = new Modules()
  modules.populate(modulesData)
})

describe('Modules constructor y populate', () => {
  test('una colección nueva está vacía', () => {
    expect(new Modules().data).toEqual([])
  })

  test('populate carga todos los módulos como instancias de Module', () => {
    expect(modules.data).toHaveLength(modulesData.length)
    modules.data.forEach(module => expect(module).toBeInstanceOf(Module))
    expect(modules.data[1]).toEqual(modulesData[1])
  })
})

describe('toString', () => {
  test('devuelve una línea por módulo', () => {
    const lines = modules.toString().split('\n')
    expect(lines).toHaveLength(modulesData.length)
    expect(lines[0]).toContain('Code: 0373')
  })
})

describe('getModuleByCode', () => {
  test('devuelve el módulo con ese código', () => {
    expect(modules.getModuleByCode('0485').cliteral).toBe('Módulo Y')
  })

  test('lanza una excepción si no existe', () => {
    expect(() => modules.getModuleByCode('9999')).toThrow(Error)
  })
})
