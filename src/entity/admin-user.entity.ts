import { AdminUser, Role } from '@prisma/client'
import { Exclude } from 'class-transformer'
import { BaseEntity } from './base.entity'

export class AdminUserEntity
	extends BaseEntity<AdminUser>
	implements AdminUser
{
	id: number
	name: string
	username: string

	@Exclude()
	password: string

	@Exclude()
	role: Role

	createdAt: Date
}
