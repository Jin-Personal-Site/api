import { BaseEntity, PostEntity } from '@/entity'
import { Post } from '@prisma/client'
import { Transform } from 'class-transformer'

type AllPostsOutput = {
	posts: Post[]
}

export class AllPostOutputDTO
	extends BaseEntity<AllPostsOutput>
	implements AllPostsOutput
{
	@Transform(({ value }) =>
		(value as Post[]).map((item) => new PostEntity(item)),
	)
	posts: PostEntity[]
}
