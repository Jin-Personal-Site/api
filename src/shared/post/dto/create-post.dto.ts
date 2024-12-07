import { Type } from 'class-transformer'
import {
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator'

export class CreatePostDTO {
	@IsString()
	@IsNotEmpty()
	title: string

	@IsOptional()
	@IsString()
	description?: string = ''

	@IsString()
	@IsNotEmpty()
	content: string

	@Type(() => Number)
	@IsPositive()
	authorId: number

	@Type(() => Boolean)
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
