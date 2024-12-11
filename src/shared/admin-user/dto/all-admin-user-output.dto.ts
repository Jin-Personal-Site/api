import { AdminUserEntity, BaseEntity } from '@/entity'
import { AdminUser } from '@prisma/client'
import { Transform } from 'class-transformer'

type AllAdminUsersOutput = {
	users: AdminUserEntity[]
}

export class AllAdminUsersOutputDTO
	extends BaseEntity<AllAdminUsersOutput>
	implements AllAdminUsersOutput
{
	@Transform(({ value }) =>
		(value as AdminUser[]).map((item) => new AdminUserEntity(item)),
	)
	users: AdminUserEntity[]
}
