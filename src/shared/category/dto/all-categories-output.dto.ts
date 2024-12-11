import { BaseEntity, CategoryEntity } from '@/entity'
import { Category } from '@prisma/client'
import { Transform } from 'class-transformer'

type AllCategoriesOutput = {
	categories: CategoryEntity[]
}

export class AllCategoriesOutputDTO
	extends BaseEntity<AllCategoriesOutput>
	implements AllCategoriesOutput
{
	@Transform(({ value }) =>
		(value as Category[]).map((item) => new CategoryEntity(item)),
	)
	categories: CategoryEntity[]
}
