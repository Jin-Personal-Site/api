import { PostEntity } from '@/entity'
import { Type } from 'class-transformer'

export class PostDetailOutputDTO {
	@Type(() => PostEntity)
	post: PostEntity
}
