import { Post, Series } from '@prisma/client'
import { BaseEntity } from './base.entity'
import { Transform } from 'class-transformer'
import { PostEntity } from './post.entity'

export class SeriesEntity extends BaseEntity<Series> implements Series {
	id: number
	name: string
	slug: string
	description: string
	thumbnail: string
	createdAt: Date

	@Transform(({ value }) =>
		(value as Post[])?.map((post) => new PostEntity(post)),
	)
	posts?: Post[]
}
