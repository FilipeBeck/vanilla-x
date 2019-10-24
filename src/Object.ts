import './Array'
import { incorporate } from './Attachment'

declare global {
	/**
	 * Objecto indexável na forma `[string:TValue]`.
	 * @param TValue Valor da propriedade.
	 */
	interface Dictionary<TValue> {
		[k: string]: TValue
	}

	/**
	 * Extensão de `Object` nativo.
	 */
	interface Object {
		/** Lista de todas as chaves. */
		readonly xKeys: string[]

		/** Lista de todos os valores. */
		readonly xValues: any[]

		/** Quantidade de propriedades existentes. */
		readonly xCount: number

		/** Determina se não possui nenhuma propriedade. */
		readonly xIsEmpty: boolean

		/** Verifica se `this` é do tipo `T`. */
		xIs<T extends new (...args: any[]) => any>($type: T): this is T

		/** Retorna uma versão do método ligado com `this`. O valor de retorno é cacheado internamente (duas invocações para o mesmo método retornam a mesma referência). */
		xBind<TShape extends object, K extends keyof TShape>(this: TShape, key: K): TShape[K] extends ((...args: any[]) => any )? TShape[K] : never

		/** Retorna uma cópia profunda de `this`. */
		xClone<TShape extends object>(this: TShape): TShape

		/** Modifica a propriedade indicada por `path`. */
		xMutate<TShape extends object>(this: TShape, ...path: Object.Cast<Object.Path<TShape>, any[]>): TShape

		/** Limpa todas as propriedades falseáveis. As demais devem ser explicitadas. */
		xClear<TShape extends object>(this: TShape, newProps: Object.PartialCleanable<TShape>): TShape

		/** Iterador na forma `[$chave, $valor]`. */
		[Symbol.iterator]<TShape extends object>(this: TShape): Iterator<[string, any]>
	}

	/** Fornece tipos relacionados à `Object`. */
	namespace Object {
		/**
		 * Typecast de `TIn` para `TOut`. Útil em ocasiões onde o typescript falha em inferir quando deveria.
		 * @param TIn Tipo a ser convertido.
		 * @param TOut Tipo para o qual `TIn` será convertido.
		 */
		export type Cast<TIn, TOut> = TIn extends TOut ? TIn : TOut

		/**
		 * Infere a união entre os tipos das propriedades de `TObj`.
		 * @param TObj Objeto a ser inferido.
		 */
		export type TypeOfProps<TObj> = TObj[keyof TObj]

		/**
		 * Infere se `T` é um tipo primitivo.
		 * @param T Tipo a ser inferido.
		 */
		export type IsPrimitive<T> = (
			T extends number ? true :
			T extends string ? true :
			T extends boolean ? true :
			T extends null ? true :
			T extends undefined ? true :
			false
		)

		/**
		 * Infere se `T` é um tipo "falseável" (um tipo que pode ser limpado com `""`, `0`, `false` ou `[]`, por exemplo) sem quebrar a consistência de seu tipo.
		 * @param T Tipo a ser inferido.
		 * @example
		 * type IsClr1 = Object.IsCleanable<number>; // true - pode-se atribuir `0` a `number`
		 * type IsClr2 = Object.IsCleanable<boolean[]>; // true - pode-se atribuir `[]` à `boolean[]`
		 * type ISClr3 = Object.IsCleanable<string>; // true - pode-se atribuir `""` à `string`
		 * type ISClr4 = Object.IsCleanable<'male' | 'female'>; // false - não se pode atribuir `""` à união `'male' | 'female'`
		 * type IsCrl5 = Object.IsCleanable<{ x: number, y: number }>; // false - não se pode atribuir um valor falseável
		 * type IsCrl6 = Object.IsCleanable< {} >; // false
		 */
		export type IsCleanable<T> = (
			IsUnion<T> extends true ? false : (
				IsPrimitive<T> extends true ? true : (
					T extends any[] ? true : false
				)
			)
		)

		/**
		 * Infere um merge entre `TBase` e `TOverwrite`, dando prioridade às props de `TOverwrite`.
		 * @param TBase Tipo base do merge.
		 * @param TOverwrite Tipo prioritário do merge.
		 */
		export type Overlap<TBase, TOverwrite> = {
			[K in keyof (TBase & TOverwrite)]: (
				K extends keyof TOverwrite ? TOverwrite[K] :
				K extends keyof TBase ? TBase[K] :
				never
			)
		}

		/**
		 * Extrai as chaves de `TObject` que extendam de `TProps`.
		 * @param TObject Objecto em extração.
		 * @param TProps Tipo a ser extraido.
		 */
		export type PickKeysWithTypes<TObject, TProps> = TypeOfProps<{
			[K in keyof TObject]: (
				TObject[K] extends TProps ? K : never
			)
		}>

		export type PickPropsWithTypes<TObject, TProps> = {
			[K in PickKeysWithTypes<TObject, TProps>]: TObject[K]
		}

		/**
		 * Infere a união entre as chaves de `T` não limpáveis - `IsCleanable<T> extends false`.
		 * @param T Tipo a ser inferido.
		 */
		export type NonCleanableKeys<T> = TypeOfProps<{
			[K in keyof T]: (
				IsCleanable<T[K]> extends true ? never : K
			)
		}>

		/**
		 * Infere uma interface com as propriedades não limpáveis de `T`.
		 * @param T Tipo a ser inferido.
		 */
		export type NonCleanableProps<T> = {
			[K in NonCleanableKeys<T>]: T[K]
		}

		/**
		 * Retorna um `Overlap` entre a parcialização das props de `T` e as propriedades não limpáveis de `T`.
		 */
		export type PartialCleanable<T> = Overlap<Partial<T>, NonCleanableProps<T>>

		/**
		 * Infere se `T` é uma união entre 2 ou mais tipos.
		 * @param T Tipo a ser inferido.
		 * @private_param `TKeys` - Refrência à `T`.
		 */
		export type IsUnion<T, TKeys = T> = T extends boolean ? false : (
			T extends infer K ? (
				TKeys extends (TKeys & K) ? false : true
			) : false
		) extends false ? false : true

		/**
		 * Infere a união entre todos os caminhos de acesso possíveis a todas as propriedades de `TObject`.
		 * @param TObject Objeto a ser inferido.
		 * @private_param TPath - Armazena os paths nas iterações da definição.
		 * @private_param TKeys - Referência à união entre as chaves de `TObject`.
		 * @example
		 * interface SomeInter {
		 *   a1: {
		 *     b1: number
		 *     c1: string
		 *   }
		 *   a2: boolean
		 * }
		 * type PathOfSomeInter = Object.Path<SomeInter>;
		 * const paths: PathOfSomeInter[] = [
		 *   ['a1', 'b1', 6],
		 *   ['a1', { b1: 11, c1: '1984' }],
		 *   ['a1', 'c1', '1984'],
		 *   ['a2', true],
		 *   [{ a1: { b1: 10, c1: '20' }, a2: false }]
		 * ]
		 */
		export type Path<TObject, TLast extends boolean = true, TPath extends any[] = [], TKeys = keyof TObject> = {
			0: TLast extends true ? Array.Pushed<TPath, TObject> : TPath
			1: Object.IsPrimitive<TObject> extends false ? (
				TKeys extends infer TKey ? (
					(Path<
						TObject[Cast<TKey, keyof TObject>],
						TLast,
						Cast<Array.Pushed<TPath, TKey>, any[]>
					> extends infer TS2589Guard ? TS2589Guard : never) | (
						TLast extends true ? Array.Pushed<TPath, TObject> : TPath
					)
				) : TPath
			) : TLast extends true ? Array.Pushed<TPath, TObject> : TPath
		}[Object.IsPrimitive<TObject> extends true ? 0 : 1]
	}
}

/* Mapa de métodos ligados com `this` das instâncias  */
const bindMap = new WeakMap<Object, WeakMap<any, any>>()

incorporate(Object.prototype, {
	xIs($type: any) {
		if (this instanceof $type) {
			return true
		}
		if ($type == Number as any) {
			return typeof this == 'number'
		}
		if ($type == String as any) {
			return typeof this == 'string'
		}
		if ($type == Boolean as any) {
			return typeof this == 'boolean'
		}

		return false
	},
	xKeys: {
		get() {
			return Object.keys(this)
		}
	},
	xValues: {
		get() {
			return Object.keys(this).map(key => (this as any)[key])
		}
	},
	xCount: {
		get() {
			return Object.keys(this).length
		}
	},
	xIsEmpty: {
		get() {
			return Object.keys(this).length == 0
		}
	},
	xBind(this: Object, key: keyof Object) {
		const method: any = this[key]
		let instanceBindings = bindMap.get(this)

		if (!instanceBindings) {
			bindMap.set(this, instanceBindings = new WeakMap())
		}

		let binded = instanceBindings.get(method)

		if (!binded) {
			instanceBindings.set(method, binded = method.bind(this))
		}

		return binded
	},
	xClone(this: Object) {
		const cloned = this.constructor.call(null)

		for (let key in this) {
			let propOfThis = (this as any)[key]

			if (typeof propOfThis == 'object') {
				propOfThis = Object.prototype.xClone.call(propOfThis)
			}

			cloned[key] = propOfThis
		}

		return cloned
	},
	xMutate(this: any, ...path: any[]) {
		const mutatedProp = path.pop()

		let iterator = this

		for (const key of path) {
			iterator = iterator[key]
		}

		Object.assign(iterator, mutatedProp)

		return this
	},
	xClear(this: any, newProps: any) {
		for (const key in this) {
			const newProp = newProps[key]

			this[key] = newProp !== undefined ? newProp : this[key].constructor.call()
		}

		return this
	}
})

Object.defineProperty(Object.prototype, Symbol.iterator, {
	enumerable: false,
	configurable: true,
	writable: true,
	value: function*() {
		for (let key in this) {
			yield [key, this[key]]
		}
	}
})

export = null