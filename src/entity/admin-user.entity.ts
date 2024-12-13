import { AdminUser, Role } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'

export class AdminUserEntity implements AdminUser {
	id: number
	name: string
	username: string

	@Expose({ groups: ['me'] })
	@ApiHideProperty()
	password: string

	@ApiProperty({ enum: Role })
	role: Role

	@Type(() => Date)
	createdAt: Date
}
