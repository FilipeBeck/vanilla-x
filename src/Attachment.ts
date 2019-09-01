/**
 * Descritor de anexo de propriedade. Usado para incorporar as implementações de métodos e propriedades extendidas.
 * @param TPrototype Protótipo a ser inferido como `this` nas funções.
 * @param TProps Propriedade a ser anexada.
 */
export type AttachmentDescriptor<TPrototype, TProp> = (
	[TProp] extends [(...args: infer TArgs) => infer TReturn] ? (
		(this: TPrototype, ...args: TArgs) => TReturn
	) : [TProp] extends [Function] ? ( // NOTE: Algumas funções não estão sendo inferidas
		Function
	) : (
		{ get(this: TPrototype): TProp } |
		{ set(this: TPrototype, v: TProp): void } |
		{ get(this: TPrototype): TProp, set(this: TPrototype, v: TProp): void }
	)
)

/**
 * Mapa de descritores de anexo.
 * @param TPrototype Protótipo a ser extendido.
 */
export type AttachmentMap<TPrototype extends object> = {
	[K in keyof TPrototype]?: AttachmentDescriptor<TPrototype, TPrototype[K]>
}

/**
 * Incorpora as propriedades e funções de `attachmentMap` à `prototype`.
 * @param prototype Protótipo a ser extendido.
 * @param attachmentMap Mapa de anexos com as implementações.
 */
export function incorporate<TPrototype extends object>(prototype: TPrototype, attachmentMap: AttachmentMap<TPrototype>): void {
	for (let key in attachmentMap) {
		let descriptor = (attachmentMap as any)[key] as PropertyDescriptor

		if (typeof descriptor == 'function') {
			descriptor = {
				value: descriptor,
				writable: true
			}

			;(attachmentMap as any)[key] = descriptor
		}

		descriptor.configurable = true
		descriptor.enumerable = false
	}

	Object.defineProperties(prototype, attachmentMap as PropertyDescriptorMap)
}