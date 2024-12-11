import { BaseEntity, CategoryEntity } from '@/entity'
import { Category } from '@prisma/client'
import { Transform } from 'class-transformer'

type CreateCategoryResult = {
	category: CategoryEntity
}

export class CreateCategoryResultDTO
	extends BaseEntity<CreateCategoryResult>
	implements CreateCategoryResult
{
	@Transform(({ value }) => new CategoryEntity(value as Category))
	category: CategoryEntity
}
