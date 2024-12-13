import { PostEntity } from '@/entity'
import { Type } from 'class-transformer'

export class DeletePostResultDTO {
	@Type(() => PostEntity)
	deletedPost: PostEntity
}
