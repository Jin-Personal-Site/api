import { BaseEntity, CategoryEntity } from '@/entity'
import { Category } from '@prisma/client'
import { Transform } from 'class-transformer'

type UpdateCategoryResult = {
	updatedCategory: CategoryEntity
}

export class UpdateCategoryResultDTO
	extends BaseEntity<UpdateCategoryResult>
	implements UpdateCategoryResult
{
	@Transform(({ value }) => new CategoryEntity(value as Category))
	updatedCategory: CategoryEntity
}
