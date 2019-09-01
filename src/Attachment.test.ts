import { incorporate, AttachmentDescriptor, AttachmentMap } from './Attachment'
import { diagnose } from 'ts-infer'

describe('Tipagem', () => {
	test('inferência de `AttachmentDescriptor', () => {
		const goodAssignments = () => {
			let functionDescriptor: AttachmentDescriptor<{ name: string }, (arg: number) => string>
			let propertyDescriptor: AttachmentDescriptor<{ id: string }, string>

			functionDescriptor = function(arg: number) {
				return this.name
			}

			propertyDescriptor = { get() { return this.id } }
			propertyDescriptor = { set(v: string) { this.id = v } }
			propertyDescriptor = { get() { return this.id }, set(v: string) { this.id = v } }

			return { functionDescriptor, propertyDescriptor }
		}

		const badAssignments = diagnose(() => {
			let functionDescriptor: AttachmentDescriptor<{ name: string }, (arg: string) => number>
			let propertyDescriptor: AttachmentDescriptor<{ id: string }, string>

      // @ts-ignore 1
			functionDescriptor = { get() { return 1984 } }
      // @ts-ignore 2	
			propertyDescriptor = 42
      // @ts-ignore 3	
			propertyDescriptor = '42'
      // @ts-ignore 4	
			propertyDescriptor = true
			// @ts-ignore 5
			propertyDescriptor = { get() { return 11 } }
			// @ts-ignore 6
			propertyDescriptor = { get() { return this.id }, another: true }
      // @ts-ignore 7
			propertyDescriptor = { set(v: string) { this.id = v }, another: true }
			// @ts-ignore 8
			propertyDescriptor = { get() { return this.id }, set(v: string) { this.id = v }, another: true }
			// @ts-ignore 9
			propertyDescriptor = { get() { return 11 } }

			return { functionDescriptor, propertyDescriptor }
		})

		expect(goodAssignments).not.toThrow()
		expect(badAssignments.length).toBe(9)
	})

	test('inferência de `AttachmentMap` em conformidade', () => {
		const goodAssignments = () => {
			interface Inter {
				prop1: string
				prop2: number
				method1(): void
				method2(arg: string): void
				method3(arg: string): number
			}

			const map: AttachmentMap<Inter> = {
				prop1: { get() { return 'Beck' } },
				prop2: { get() { return 42 }, set(v: number) { return } },
				method1() { return },
				method2(arg: string ) { return 'Hello' },
				method3(arg: string) { return 42 }
			}

			return map
		}

		const badAssignments = diagnose(() => {
			interface Inter {
				prop1: string
				prop2: number
				method1(): void
				method2(arg: string): void
				method3(arg: string): number
			}

			const map: AttachmentMap<Inter> = {
				// @ts-ignore 1
				prop1() { return '11' },
				// @ts-ignore 2
				prop2: { get() { return '42' }, set(v: number) { return } },
				// @ts-ignore 3
				prop2: { get() { return 42 }, set(v: string) { return } },
				// @ts-ignore 4
				method1(arg: string) { return 10 },
				// @ts-ignore 5
				method2(arg: boolean) { return },
				// @ts-ignore 6
				method3(arg: string) { return '42' }
			}

			return map
		})

		expect(goodAssignments).not.toThrow()
		expect(badAssignments.length).toBeGreaterThanOrEqual(6)
	})
})

describe('Attachment', () => {
	class AClass {
		public get a() { return 2 }
		public get b() { return 4 }
		public foo() { return this.a + this.b }
	}

	test('pre-incorporate', () => {
		const preIncorporated = new AClass()

		expect(preIncorporated.a).toBe(2)
		expect(preIncorporated.b).toBe(4)
		expect(preIncorporated.foo()).toBe(2 + 4)
	})

	test('pos-incorporate', () => {
		incorporate(AClass.prototype, {
			a: { get() { return 8 } },
			b: { get() { return 16 } },
			foo(this: AClass) { return this.a * this.b }
		})

		const posIncorporated = new AClass()

		expect(posIncorporated.a).toBe(8)
		expect(posIncorporated.b).toBe(16)
		expect(posIncorporated.foo()).toBe(8 * 16)
	})
})