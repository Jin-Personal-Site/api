import { CategoryEntity } from '@/entity'
import { Type } from 'class-transformer'

export class CreateCategoryResultDTO {
	@Type(() => CategoryEntity)
	category: CategoryEntity
}
