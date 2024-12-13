import { PostEntity } from '@/entity'
import { Type } from 'class-transformer'

export class CreatePostResultDTO {
	@Type(() => PostEntity)
	post: PostEntity
}
