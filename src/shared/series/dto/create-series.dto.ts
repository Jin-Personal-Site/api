import { Prisma } from '@prisma/client'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateSeriesDTO implements Prisma.SeriesUncheckedCreateInput {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsString()
	@IsNotEmpty()
	slug: string

	@IsString()
	@IsNotEmpty()
	description: string

	thumbnail?: string
}
