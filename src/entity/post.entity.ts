import { AdminUser, Category, Post } from '@prisma/client'
import { BaseEntity } from './base.entity'
import { Exclude, Transform } from 'class-transformer'
import { AdminUserEntity } from './admin-user.entity'
import { CategoryEntity } from './category.entity'
import { ApiHideProperty } from '@nestjs/swagger'
import { SeriesEntity } from './series.entity'

export class PostEntity extends BaseEntity<Post> implements Post {
	id: number
	title: string
	description: string
	content: string

	@Exclude()
	@ApiHideProperty()
	approved: boolean

	@Exclude()
	@ApiHideProperty()
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
	createdAt: Date

	updatedAt: Date
	publishedAt: Date

	@Transform(({ value }) => new AdminUserEntity(value))
	author: AdminUserEntity

	@Transform(({ value }) => (value ? new CategoryEntity(value) : null))
	category?: CategoryEntity

	@Transform(({ value }) => (value ? new SeriesEntity(value) : null))
	series?: SeriesEntity
}
