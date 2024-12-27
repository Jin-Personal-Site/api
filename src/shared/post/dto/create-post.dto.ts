import { Prisma } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import {
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator'

export class CreatePostDTO implements Partial<Prisma.PostUncheckedCreateInput> {
	@IsString()
	@IsNotEmpty()
	title: string

	@IsOptional()
	@IsString()
	description?: string = ''

	@IsString()
	@IsNotEmpty()
	content: string

	@Transform(({ value }) => !!JSON.parse(value))
	@IsBoolean()
	published: boolean

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
