import { Category } from '@prisma/client'
import { Type } from 'class-transformer'

export class CategoryEntity implements Category {
	id: number
	name: string
	slug: string
	color: string

	@Type(() => Date)
	createdAt: Date
}
