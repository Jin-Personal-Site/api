export class BaseEntity<T extends Record<any, any> = Record<string, any>> {
	constructor(partial: Partial<T>) {
		Object.assign(this, partial)
	}
}
