import './Array'

declare global {
	/**
	 * Extensão de `Function`.
	 */
	interface Function {
		
	}
	/* Inerência de `Function` */
	namespace Function {
		/** Infere uma função com os argumentos `TArgs` e valor de retorno `TRet`. */
		export type Closure<TArgs extends any[], TRet = any> = (...args: TArgs) => TRet

		/** Infere os argumentos e valor de retorno na forma `[[$argumentos], $retorno]. */
		export type Signature<TClosure extends Closure<any[]>> = TClosure extends (...args: infer TArgs) => infer TRet ? [TArgs, TRet]  : never

		/** Função default. */
		export type Any = Closure<any[]>
	}
}

export = null