import { Category } from '@prisma/client'
import { BaseEntity } from './base.entity'

export class CategoryEntity extends BaseEntity<Category> implements Category {
	id: number
	name: string
	slug: string
	color: string
	createdAt: Date
}
