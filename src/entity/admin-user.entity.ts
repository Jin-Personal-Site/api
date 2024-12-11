import { AdminUser, Role } from '@prisma/client'
import { Exclude } from 'class-transformer'
import { BaseEntity } from './base.entity'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'

export class AdminUserEntity
	extends BaseEntity<AdminUser>
	implements AdminUser
{
	id: number
	name: string
	username: string

	@Exclude()
	@ApiHideProperty()
	password: string

	@ApiProperty({ enum: Role })
	role: Role
	createdAt: Date
}
