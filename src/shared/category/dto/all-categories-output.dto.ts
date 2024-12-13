import { CategoryEntity } from '@/entity'
import { Type } from 'class-transformer'

export class AllCategoriesOutputDTO {
	@Type(() => CategoryEntity)
	categories: CategoryEntity[]
}
