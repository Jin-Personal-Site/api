import { Prisma } from '@prisma/client'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateSeriesDTO implements Prisma.SeriesUncheckedUpdateInput {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	name?: string

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	slug?: string

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	description?: string

	thumbnail?: string
}
