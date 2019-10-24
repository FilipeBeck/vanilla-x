import './Object'
import './Function'
import { incorporate } from './Attachment'


declare global {
	/**
	 * Extensão de `Array`.
	 */
	interface Array<T> {
		/** Primeiro elemento da lista. */
		readonly xFirst: T

		/** Último elemento da lista. */
		readonly xLast: T

		/** Determina se a lista está vazia. */
		readonly xIsEmpty: boolean

		/** Lista de [índice, elemento]. */
		readonly xIterated: Array<[number, T]>
	}
	/* Inerência de `Array` */
	namespace Array {
		export type FromUnion<TUnion, TMapped extends any[] = [], TKeys = TUnion> = {
			0: TMapped,
			1: TUnion extends infer TU ? (
				FromUnion<
					Exclude<TKeys, TU>,
					Object.Cast<
						Array.Pushed<TMapped, TU> extends infer TS2589Guard ? TS2589Guard : never,
						any[]
					>
				>
			) : TMapped
		}[[TUnion] extends [never] ? 0 : 1]

		/**
		 * Infere a união entre os tipos das propriedades de `TList`.
		 * @param TList Lista a ser inferida.
		 */
		export type TypeOfProps<TList extends any[]> = TList extends Array<infer T> ? T : never
		
		/**
		 * Infere o primeiro item `TList`.
		 * @param TList Lista a ser inferida.
		 */
		export type First<TList extends any[]> = TList extends [infer TFirst, ...any[]] ? TFirst : never

		/**
		 * Infere o último item de `TList`.
		 * @param TList Lista a ser inferida.
		 */
		export type Last<TList extends any[]> = {
			0: First<TList>
			1: Last<Shifted<TList>> extends infer TS2589Guard ? TS2589Guard : never
		}[TList extends [any] ? 0 : 1]

		/**
		 * Infere a ordem reversa de `TList`.
		 * @param TList Lista a ser inferida.
		 * @param TReversed Parâmetro interno - mantém o resultado final da reversão.
		 */
		export type Reverse<TList extends any[], TReversed extends any[] = []> = {
			0: TReversed
			1: Reverse<TList, Array.Unshifted<TReversed, TList[TReversed['length']]>> extends infer TS2589Guard ? TS2589Guard : never
		}[TList['length'] extends TReversed['length'] ? 0 : 1]

		/**
		 * Infere `TList` com `TIem` pós-concatenado - `[...TList, Titem]`.
		 * @param TList Lista a ser inferida.
		 * @param TItem Item a ser concatenado no final de `TList`.
		 */
		export type Pushed<TList extends any[], TItem> = (
			Reverse<
				Unshifted<
					Object.Cast<
						Reverse<TList> extends infer TS2589Guard ? TS2589Guard : never,
						any[]
					>,
					TItem
				>
			> extends infer TS2589Guard ? TS2589Guard : never
		)

		/**
		 * Infere os items subsequentes ao primeiro item de `TList`.
		 * @param TList Lista a ser inferida.
		 */
		export type Shifted<TList extends any[]> = (
			Function.Closure<TList> extends ((first: any, ...rest: infer TRest) => any) ? TRest : []
		)

		/**
		 * Infere `TList` com `TItem` pré-concatenado - `[TItem, ...TList]`
		 * @param TList Lista a ser inferida.
		 * @param TItem Item a ser concatenado no começo de `TList`.
		 */
		export type Unshifted<TList extends any[], TItem> = Parameters<(first: TItem, ...rest: TList) => any>

		/**
		 * Infere os items antecedentes ao último item de `TList`.
		 */
		export type Poped<TList extends any[]> = (
			Reverse<
				Shifted<
					Object.Cast<
						Reverse<TList> extends infer TS2589Guard ? TS2589Guard : never,
						any[]
					>
				>
			> extends infer TS2589Guard ? TS2589Guard : never
		)
	}
}

incorporate(Array.prototype, {
	xFirst: {
		get() {
			return this[0]
		}
	} as any,
	xLast: {
		get() {
			return this[this.length - 1]
		}
	} as any,
	xIsEmpty: {
		get() {
			return this.length == 0
		}
	} as any,
	xIterated: {
		get() {
			return this.map((value: any, index: number) => [index, value])
		}
	} as any
} as any)

export = null
