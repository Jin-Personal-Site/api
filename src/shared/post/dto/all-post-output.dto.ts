import { Pagination } from '@/common'
import { PostEntity } from '@/entity'
import { Type } from 'class-transformer'

export class AllPostOutputDTO {
	@Type(() => PostEntity)
	posts: PostEntity[]

	@Type(() => Pagination)
	pagination: Pagination
}
