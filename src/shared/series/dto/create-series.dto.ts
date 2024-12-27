import { Prisma } from '@prisma/client'
import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class CreateSeriesDTO implements Prisma.SeriesUncheckedCreateInput {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
		message: 'Slug must be lowercase, alphanumeric, and can contain hyphens.',
	})
	slug: string

	@IsString()
	@IsNotEmpty()
	description: string

	thumbnail?: string
}
