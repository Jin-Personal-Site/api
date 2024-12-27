import { Prisma } from '@prisma/client'
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class UpdateSeriesDTO implements Prisma.SeriesUncheckedUpdateInput {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	name?: string

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
		message: 'Slug must be lowercase, alphanumeric, and can contain hyphens.',
	})
	slug?: string

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	description?: string

	thumbnail?: string
}
