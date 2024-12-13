import { Post, Series } from '@prisma/client'
import { Type } from 'class-transformer'
import { PostEntity } from './post.entity'

export class SeriesEntity implements Series {
	id: number
	name: string
	slug: string
	description: string
	thumbnail: string

	@Type(() => Date)
	createdAt: Date

	@Type(() => PostEntity)
	posts?: Post[]
}
