import { BaseEntity, CategoryEntity } from '@/entity'
import { Category } from '@prisma/client'
import { Transform } from 'class-transformer'

type DeleteCategoryResult = {
	deletedCategory: CategoryEntity
}

export class DeleteCategoryResultDTO
	extends BaseEntity<DeleteCategoryResult>
	implements DeleteCategoryResult
{
	@Transform(({ value }) => new CategoryEntity(value as Category))
	deletedCategory: CategoryEntity
}
