import { AdminUserEntity } from '@/entity'
import { Type } from 'class-transformer'

export class AllAdminUsersOutputDTO {
	@Type(() => AdminUserEntity)
	users: AdminUserEntity[]
}
