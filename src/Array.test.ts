import './Array'
// import infer, { diagnose } from 'ts-infer'

// describe('Tipagem', () => {

// })

describe('Lista de chaves e valores', () => {
	test('first', () => {
		const list = [1, 2, 3, 4]
		expect(list.xFirst).toBe(1)
	})

	test('last', () => {
		const list = [1, 2, 3, 4]
		expect(list.xLast).toBe(4)
	})

	test('isEmpty', () => {
		const list1 = [1, 2, 3, 4]
		const list2 = Array()

		expect(list1.xIsEmpty).not.toBeTruthy()
		expect(list2.xIsEmpty).toBeTruthy()
	})

	test('iterated', () => {
		const list = ['one', 'two', 'three', 'four']
		expect(list.xIterated).toEqual([[0, 'one'], [1, 'two'], [2, 'three'], [3, 'four']])
	})
})