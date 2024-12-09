import { Prisma } from '@prisma/client'
import { Type } from 'class-transformer'
import {
	IsString,
	IsNotEmpty,
	IsOptional,
	IsBoolean,
	IsPositive,
} from 'class-validator'

export class UpdatePostDTO implements Prisma.PostUncheckedUpdateInput {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	title?: string

	@IsOptional()
	@IsString()
	@IsOptional()
	description?: string | null

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	content?: string | null

	@IsBoolean()
	@IsOptional()
	approved?: boolean

	@IsBoolean()
	@IsOptional()
	published?: boolean

	thumbnail?: string
	coverImage?: string

	@Type(() => Number)
	@IsPositive()
	@IsOptional()
	categoryId?: number

	@Type(() => Number)
	@IsPositive()
	@IsOptional()
	seriesId?: number
}
