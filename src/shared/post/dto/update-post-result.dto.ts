import { PostEntity } from '@/entity'
import { Type } from 'class-transformer'

export class UpdatePostResultDTO {
	@Type(() => PostEntity)
	updatedPost: PostEntity
}
