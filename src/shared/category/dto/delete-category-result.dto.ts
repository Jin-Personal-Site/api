import { CategoryEntity } from '@/entity'
import { Type } from 'class-transformer'

export class DeleteCategoryResultDTO {
	@Type(() => CategoryEntity)
	deletedCategory: CategoryEntity
}
