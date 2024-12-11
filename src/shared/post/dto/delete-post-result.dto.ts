import { BaseEntity, PostEntity } from '@/entity'
import { Post } from '@prisma/client'
import { Transform } from 'class-transformer'

type DeletePostResult = {
	deletedPost: Post
}

export class DeletePostResultDTO
	extends BaseEntity<DeletePostResult>
	implements DeletePostResult
{
	@Transform(({ value }) => new PostEntity(value as Post))
	deletedPost: PostEntity
}
