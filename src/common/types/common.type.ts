import { Exclude, Expose } from 'class-transformer'
import { clamp } from 'lodash'

export class Pagination {
	@Exclude()
	private _page: number

	@Expose()
	get page() {
		return clamp(this._page, 1, this.maxPage)
	}

	set page(value: number) {
		this._page = value
	}

	limit: number
	totalCount: number

	@Expose()
	get maxPage() {
		return Math.floor(this.totalCount / this.limit) + 1
	}
}
