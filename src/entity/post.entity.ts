import { AdminUser, Category, Post } from '@prisma/client'
import { BaseEntity } from './base.entity'
import { Exclude, Transform } from 'class-transformer'
import { AdminUserEntity } from './admin-user.entity'
import { CategoryEntity } from './category.entity'

export class PostEntity extends BaseEntity<Post> implements Post {
	id: number
	title: string
	description: string
	content: string

	@Exclude()
	approved: boolean

	@Exclude()
	published: boolean

	@Exclude()
	authorId: number
	thumbnail: string
	coverImage: string

	@Exclude()
	categoryId: number

	@Exclude()
	seriesId: number

	@Exclude()
	createdAt: Date

	updatedAt: Date
	publishedAt: Date

	@Transform(({ value }) => new AdminUserEntity(value))
	author: AdminUser

	@Transform(({ value }) => new CategoryEntity(value))
	category: Category
}
