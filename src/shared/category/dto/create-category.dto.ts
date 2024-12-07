import { IsOptional, IsString, Matches } from 'class-validator'

export class CreateCategoryDTO {
	@IsString()
	name: string

	@IsString()
	@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
		message:
			'Slug must be lowercase and can only contain letters, numbers, and hyphens.',
	})
	slug: string

	@IsOptional()
	@IsString()
	@Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3}|[0-9A-Fa-f]{8}|[0-9A-Fa-f]{4})$/, {
		message:
			'Color must be a valid hex value (e.g., #FFFFFF, #FFF, #000000FF, or #0000).',
	})
	color?: string
}
