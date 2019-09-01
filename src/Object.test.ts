import './Object'
import infer, { diagnose } from 'ts-infer'

describe('Tipagem', () => {
	test('chaves e propriedades de `Dictionary` em conformidade', () => {
		const validInferences = () => {
			const dictionary: Dictionary<string> = {
				name: 'dictionator'
			}
			dictionary['id'] = '1234'
		}

		const invalidInferences = diagnose(() => {
			const dictionary: Dictionary<string> = {
				name: 'dictionator'
			}
			// @ts-ignore
			dictionary['count'] = 20
		})

		expect(validInferences).not.toThrow()
		expect(invalidInferences.length).toBe(1)
	})

	test('conversão de `Object.Cast` em conformidade', () => {
		const validInferences = () => {
			const expected1: Object.Cast<string[], number[]> = [5]
			const expected2: Object.Cast<boolean[], any[]> = [true]

			return [expected1, expected2]
		}

		const invalidInferences = () => {
			infer(() => {
				// @ts-ignore
				const expected: Object.Cast<string, number> = '42'

				return expected
			})
		}
		
		expect(validInferences).not.toThrow()
		expect(invalidInferences).toThrow()
	})

	test('união de `Object.TypeOfProps` em conformidade', () => {
		const validInferences = () => {
			interface TProps { a: number, b: any[], c: 'c', d: never }
			let abc: Object.TypeOfProps<TProps>
			
			abc = 1; abc = [2]; abc = 'c'
			return abc
		}

		const invalidInferences = () => {
			infer(() => {
				interface TProps { a: number, b: any[], c: 'c', d: never }
				let abc: Object.TypeOfProps<TProps>
				// @ts-ignore
				abc = true
				return abc
			})
		}

		expect(validInferences).not.toThrow()
		expect(invalidInferences).toThrow()
	})

	test('inferência de `Object.isPrimitive` em conformidade', () => {
		const validInferences = () => {
			const isPrimitive1: Object.IsPrimitive<number> = true
			const isPrimitive2: Object.IsPrimitive<string> = true
			const isPrimitive3: Object.IsPrimitive<boolean> = true
			const isPrimitive4: Object.IsPrimitive<null> = true
			const isPrimitive5: Object.IsPrimitive<undefined> = true
			const isPrimitive6: Object.IsPrimitive<{}> = false
			const isPrimitive7: Object.IsPrimitive<[]> = false
			const isPrimitive8: Object.IsPrimitive<Math> = false

			return { isPrimitive1, isPrimitive2, isPrimitive3, isPrimitive4, isPrimitive5, isPrimitive6, isPrimitive7, isPrimitive8 }
		}

		expect(validInferences).not.toThrow()
	})

	test('inferência de `Object.isCleanable` em conformidade', () => {
		const validInferences = () => {
			class AClass { }
			const isCleanable1: Object.IsCleanable<number> = true
			const isCleanable2: Object.IsCleanable<string> = true
			const isCleanable3: Object.IsCleanable<boolean> = true
			const isCleanable4: Object.IsCleanable<null> = true
			const isCleanable5: Object.IsCleanable<undefined> = true
			const isCleanable6: Object.IsCleanable<any[]> = true
			const isCleanable7: Object.IsCleanable<string[]> = true
			const isCleanable8: Object.IsCleanable<{}> = false
			const isCleanable9: Object.IsCleanable<1 | 2> = false
			const isCleanable10: Object.IsCleanable<{ a: number }> = false
			const isCleanable11: Object.IsCleanable<Math> = false
			const isCleanable12: Object.IsCleanable<AClass> = false

			return { isCleanable1, isCleanable2, isCleanable3, isCleanable4, isCleanable5, isCleanable6, isCleanable7, isCleanable8, isCleanable9, isCleanable10, isCleanable11, isCleanable12 }
		}

		expect(validInferences).not.toThrow()
	})

	test('propriedades de `Object.Overlap` em conformidade', () => {
		const validInferences = () => {
			interface TBase { a: number, b: number, c: unknown, d: object }
			interface TOverwrite { b: string, c: any[] }
			const goodOverlaped: Object.Overlap<TBase, TOverwrite> = {
				a: 1, b: '2', c: [3], d: {}
			}
			return goodOverlaped
		}

		const invalidInferences = () => {
			infer(() => {
				interface TBase { a: number, b: number, c: unknown, d: object }
				interface TOverwrite { b: string, c: any[] }
				const badOverlaped: Object.Overlap<TBase, TOverwrite> = {
					// @ts-ignore
					a: 1, b: 2, c: 3, d: 5
				}
				return badOverlaped
			})
		}

		expect(validInferences).not.toThrow()
		expect(invalidInferences).toThrow()
	})

	test('propriedades de `Object.PickKeysWithTypes', () => {
		const validInferences = () => {
			interface Inter {
				a: string
				b: number
				c: string
				d: boolean
				e: Object
			}

			let pickedKeys: Object.PickKeysWithTypes<Inter, string | number>

			pickedKeys = 'a'
			pickedKeys = 'b'
			pickedKeys = 'c'

			return pickedKeys
		}

		const invalidInferences = diagnose(() => {
			interface Inter {
				a: string
				b: number
				c: string
				d: boolean
				e: Object
			}

			let pickedKeys: Object.PickKeysWithTypes<Inter, string | number>
			// @ts-ignore
			pickedKeys = 'd'
			// @ts-ignore
			pickedKeys = 'e'
			// @ts-ignore
			pickedKeys = 'f'

			return pickedKeys
		})

		expect(validInferences).not.toThrow()
		expect(invalidInferences.length).toBe(3)
	})

	test('propriedades de `Object.PickPropsWithTypes` em conformidade', () => {
		const validInferences = () => {
			interface Inter {
				a: string
				b: number
				c: string
				d: boolean
				e: Object
			}

			let pickedProps: Object.PickPropsWithTypes<Inter, string | number>

			pickedProps = {
				a: 'one',
				b: 1984,
				c: 'two'
			}

			return pickedProps
		}

		const invalidInferences = diagnose(() => {
			interface Inter {
				a: string
				b: number
				c: string
				d: boolean
				e: Object
			}

			let pickedProps: Object.PickPropsWithTypes<Inter, string | number>

			pickedProps = {
				// @ts-ignore 1
				d: true,
				// @ts-ignore 2
				e: {}
			}

			return pickedProps
		})

		expect(validInferences).not.toThrow()
		expect(invalidInferences.length).toBeGreaterThan(2)
	})
	
	test('união de `Object.NonCleanableKeys` em conformidade', () => {
		const validInferences = () => {
			interface TProps { a: number, b: number[], c: '1' | '2', d: { e: number } }
			const nonCleanableKeys: Object.NonCleanableKeys<TProps>[] = ['c', 'd']

			return nonCleanableKeys
		}

		const invalidInferences = diagnose(() => {
			interface TProps { a: number, b: string, c: boolean, d: {}, e: any[], f: 1 | 2, g: { g1: number } }
			let nonCleanableKey: Object.NonCleanableKeys<TProps>
			// @ts-ignore
			nonCleanableKey = 'a'
			// @ts-ignore
			nonCleanableKey = 'b'
			// @ts-ignore
			nonCleanableKey = 'c'
			// @ts-ignore
			nonCleanableKey = 'e'

			return nonCleanableKey
		})
		
		expect(validInferences).not.toThrow()
		expect(invalidInferences.length).toBe(4)
	})

	test('uniões de tuplas de `Object.PartialCleanable` em conformidade', () => {
		const validInferences = () => {
			interface Inter {
				a: string
				b: number
				c: 'one' | 'two'
				d: {}
				e: Math
				f: { f1: string, f2: number }
			}

			type PartialInter = Object.PartialCleanable<Inter>

			let aPartialInter: PartialInter

			aPartialInter = {
				c: 'one',
				d: {},
				e: Math,
				f: { f1: 'hello', f2: 10 }
			}

			aPartialInter = {
				a: '1',
				b: 3.14,
				c: 'one',
				d: {},
				e: Math,
				f: { f1: 'hello', f2: 10 }
			}

			return aPartialInter
		}

		const invalidInferences = diagnose(() => {
			interface Inter {
				a: string
				b: number
				c: 'one' | 'two'
				d: {}
				e: Math
				f: { f1: string, f2: number }
			}

			type PartialInter = Object.PartialCleanable<Inter>

			let aPartialInter: PartialInter
			// @ts-ignore
			aPartialInter = {
				a: '1',
				b: 3.14,
				d: {}
			}
			// @ts-ignore
			aPartialInter = {

			}

			return aPartialInter
		})

		expect(validInferences).not.toThrow()
		expect(invalidInferences.length).toBe(2)
	})

	test('inferência de `Object.isUnion` em conformidade', () => {
		const validInferences = () => {
			const isUnion1: Object.IsUnion<string | number> = true
			const isUnion2: Object.IsUnion<'one' | 'two' | 'three'> = true
			const isUnion3: Object.IsUnion<string> = false
			const isUnion4: Object.IsUnion<boolean> = false
			const isUnion5: Object.IsUnion<{}> = false

			return { isUnion1, isUnion2, isUnion3, isUnion4, isUnion5 }
		}

		expect(validInferences).not.toThrow()
	})

	test('uniões de tuplas de `Object.Path` em conformidade', () => {
		const validInferences = () => {
			interface Inter {
				a: {
					aa: {
						aaa: string
						bbb: number
					}
					ab: number
				}
				b: {
					bb: number
					cc: string
				}
				c: boolean
			}

			const pathOfInter: Object.Path<Inter>[] = [
				['a', 'aa', 'aaa', 'valueForAAA'],
				['a', 'aa', 'bbb', 3.14],
				['a', 'ab', 1984],
				['b', 'bb', 11],
				['b', 'cc', 'valueForCC'],
				['c', false]
			]

			return pathOfInter
		}

		const invalidInferences = diagnose(() => {
			interface Inter {
				a: {
					aa: {
						aaa: string
						bbb: number
					}
					ab: number
				}
				b: {
					bb: number
					cc: string
				}
				c: boolean
			}

			let pathOfInter: Object.Path<Inter>
			// @ts-ignore 1
			pathOfInter = ['a', 'aa', 'aaa']
			// @ts-ignore 2
			pathOfInter = ['a', 'aa', 'bbb']
			// @ts-ignore 3
			pathOfInter = ['a', 'ab']
			// @ts-ignore 4
			pathOfInter = ['b', 'bb']
			// @ts-ignore 5
			pathOfInter = ['b', 'cc']
			// @ts-ignore 6
			pathOfInter = ['c']
			// @ts-ignore 7
			pathOfInter = ['a', 'aa', 'aaa', 3.14]
			// @ts-ignore 8
			pathOfInter = ['a', 'aa', 'bbb', 'valueForBBB']
			// @ts-ignore 9
			pathOfInter = ['a', 'ab', '1984']
			// @ts-ignore 10
			pathOfInter = ['b', 'bb', '3.14']
			// @ts-ignore 11
			pathOfInter = ['b', 'cc', 11]
			// @ts-ignore 12
			pathOfInter = ['c', Math]
			// @ts-ignore 13
			pathOfInter = ['a', 'b', 'c']

			return pathOfInter
		})

		expect(validInferences).not.toThrow()
		expect(invalidInferences.length).toBe(13)
	})
})

describe('Is', () => {
	test('valores primitivos', () => {
		const p1 = 3.14, p2 = 'Filipe Beck', p3 = true

		expect(p1.is(Number)).toBeTruthy()
		expect(p2.is(String)).toBeTruthy()
		expect(p3.is(Boolean)).toBeTruthy()

		expect(p1.is(String)).not.toBeTruthy()
		expect(p2.is(Boolean)).not.toBeTruthy()
		expect(p3.is(Number)).not.toBeTruthy()
	})

	test('valores estruturais', () => {
		class AClass {}

		const c1 = new AClass(), c2 = {}, c3 = new RegExp('.*')

		expect(c1.is(AClass)).toBeTruthy()
		expect(c2.is(Object)).toBeTruthy()
		expect(c3.is(RegExp)).toBeTruthy()

		expect(c1.is(Object)).toBeTruthy()
		expect(c2.is(RegExp)).not.toBeTruthy()
		expect(c3.is(AClass)).not.toBeTruthy()
	})
})

describe('Lista de chaves e valores', () => {
	test('keys', () => {
		const object = { a: 1, b: 2, c: 3, d: 4 }
		expect(object.keys).toEqual(['a', 'b', 'c', 'd'])
	})

	test('values', () => {
		const object = { a: 1, b: 2, c: 3, d: 4 }
		expect(object.values).toEqual([1, 2, 3, 4])
	})

	test('isEmpty', () => {
		const notEmptyObject = { a: 'hello' }
		const isEmptyObject = {}

		expect(notEmptyObject.isEmpty).not.toBeTruthy()
		expect(isEmptyObject.isEmpty).toBeTruthy()
	})

	test('count', () => {
		const withOneProperty = { a: 'hello' }
		const withTwoProperties = { a: 'hello', b: 'cosmos' }
		const withThreeProperties = { a: 'hello', b: 'cosmos', c: 6 }
		const withFourProperties = { a: 'hello', b: 'cosmos', c: 6, d: 11 }

		expect(withOneProperty.count).toBe(1)
		expect(withTwoProperties.count).toBe(2)
		expect(withThreeProperties.count).toBe(3)
		expect(withFourProperties.count).toBe(4)
	})
})

describe('Binding', () => {
	class ToBeBinded extends Object {
		public primitive = 20

		public getThis(): this {
			return this
		}
	}

	const beingBinded = new ToBeBinded()

	test('referência correta à this', () => {
		const bindedGetThis = beingBinded.bind('getThis')

		expect(bindedGetThis()).toBe(beingBinded)
	})

	test('exceção em propriedades que não são funções', () => {
		expect(() => beingBinded.bind('primitive')).toThrow()
	})

	test('cache de referência à bind já efetuado', () => {
		const binded1 = beingBinded.bind('getThis')
		const binded2 = beingBinded.bind('getThis')

		expect(binded1).toBe(binded2)
	})
})

describe('Clone', () => {
	const original = {
		a: {
			aa: {
				aaa: 'one',
				bbb: 1984
			},
			bb: 11
		},
		b: {
			c: {
				d: {
					e: 'Filipe Roberto Beck'
				}
			}
		}
	}

	const clone = original.clone()

	test('identidade diferente', () => {
		expect(clone).not.toBe(original)
	})

	test('igualdade', () => {
		expect(JSON.stringify(original)).toBe(JSON.stringify(clone))
	})
})

describe('Mutate', () => {
	test('mutação da raiz', () => {
		const object = {
			a: {
				aa: 1984
			}
		}

		const mutated = object.mutate({ a: { aa: 11 } })

		expect(mutated).toBe(object)
		expect(mutated.a.aa).toBe(11)
	})

	test('mutação de propriedade', () => {
		let object = {
			a: {
				aa: {
					aaa: 1984
				}
			}
		}

		const mutated = object.mutate('a', 'aa', { aaa: 11 })

		expect(mutated).toBe(object)
		expect(object.a.aa.aaa).toBe(11)
	})
})

describe('Clear', () => {
	test('clear', () => {
		class AClass {
			constructor() {}
		}

		interface Inter {
			a: {
				aa: number
			}
			b: string
			c: number
			d: string | number
			e: Math
			f: AClass
			g: 'one' | 'two',
			h: boolean,
			i: any[]
		}

		const object: Inter = {
			a: {
				aa: 1984
			},
			b: '11',
			c: 42,
			d: 'hello',
			e: Math,
			f: new AClass(),
			g: 'one',
			h: true,
			i: [1, 2, 3, 4]
		}

		object.clear({
			a: { aa: 0 },
			d: 1984,
			e: Math,
			f: new AClass,
			g: 'two',
		})

		expect(object).toEqual({
			a: { aa: 0 },
			b: '',
			c: 0,
			d: 1984,
			e: Math,
			f: new AClass(),
			g: 'two',
			h: false,
			i: []
		})
	})
})

describe('Iteração', () => {
	test('for-of', () => {
		const object = { a: 'hello', b: 'cosmos', c: 11, d: 1984 }

		for (const [key, value] of object) {
			const objectValue = (object as any)[key]
			expect(objectValue).toBe(value)
		}
	})
})