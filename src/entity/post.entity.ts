import { Post } from '@prisma/client'
import { Exclude, Type } from 'class-transformer'
import { AdminUserEntity } from './admin-user.entity'
import { CategoryEntity } from './category.entity'
import { ApiHideProperty } from '@nestjs/swagger'
import { SeriesEntity } from './series.entity'

export class PostEntity implements Post {
	id: number
	title: string
	description: string
	content: string
	approved: boolean
	published: boolean

	@Exclude()
	@ApiHideProperty()
	authorId: number
	thumbnail: string
	coverImage: string

	@Exclude()
	@ApiHideProperty()
	categoryId: number

	@Exclude()
	@ApiHideProperty()
	seriesId: number

	@Exclude()
	@ApiHideProperty()
	@Type(() => Date)
	createdAt: Date

	updatedAt: Date
	publishedAt: Date

	@Type(() => AdminUserEntity)
	author: AdminUserEntity

	@Type(() => CategoryEntity)
	category?: CategoryEntity

	@Type(() => SeriesEntity)
	series?: SeriesEntity
}
