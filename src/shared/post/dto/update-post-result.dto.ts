import { BaseEntity, PostEntity } from '@/entity'
import { Post } from '@prisma/client'
import { Transform } from 'class-transformer'

type UpdatePostResult = {
	updatedPost: Post
}

export class UpdatePostResultDTO
	extends BaseEntity<UpdatePostResult>
	implements UpdatePostResult
{
	@Transform(({ value }) => new PostEntity(value as Post))
	updatedPost: PostEntity
}
