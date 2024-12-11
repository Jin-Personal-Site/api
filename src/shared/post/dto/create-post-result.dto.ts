import { BaseEntity, PostEntity } from '@/entity'
import { Post } from '@prisma/client'
import { Transform } from 'class-transformer'

type CreatePostResult = {
	post: Post
}

export class CreatePostResultDTO
	extends BaseEntity<CreatePostResult>
	implements CreatePostResult
{
	@Transform(({ value }) => new PostEntity(value as Post))
	post: PostEntity
}
