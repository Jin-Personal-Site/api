import { Transform } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'

export class AllPostDTO {
	@Transform(({ value }) => Math.max(value, 1))
	@IsNumber()
	@IsOptional()
	page = 1

	@Transform(({ value }) => Math.max(value, 5))
	@IsNumber()
	@IsOptional()
	limit = 20
}
