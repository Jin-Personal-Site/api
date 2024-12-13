import { CategoryEntity } from '@/entity'
import { Type } from 'class-transformer'

export class UpdateCategoryResultDTO {
	@Type(() => CategoryEntity)
	updatedCategory: CategoryEntity
}
