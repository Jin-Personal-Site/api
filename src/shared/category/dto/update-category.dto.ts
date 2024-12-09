import { Prisma } from '@prisma/client'
import { IsString, Matches, IsOptional } from 'class-validator'

export class UpdateCategoryDTO implements Prisma.CategoryUpdateInput {
	@IsString()
	@IsOptional()
	name?: string

	@IsString()
	@IsOptional()
	@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
		message:
			'Slug must be lowercase and can only contain letters, numbers, and hyphens.',
	})
	slug?: string

	@IsString()
	@IsOptional()
	@Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3}|[0-9A-Fa-f]{8}|[0-9A-Fa-f]{4})$/, {
		message:
			'Color must be a valid hex value (e.g., #FFFFFF, #FFF, #000000FF, or #0000).',
	})
	color?: string
}
