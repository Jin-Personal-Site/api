import { AdminUserEntity, BaseEntity } from '@/entity'
import { AdminUser } from '@prisma/client'
import { Transform } from 'class-transformer'

type LoginResult = {
	message: string
	user: AdminUserEntity
}

export class LoginResultDTO
	extends BaseEntity<LoginResult>
	implements LoginResult
{
	message: string

	@Transform(({ value }) => new AdminUserEntity(value as AdminUser))
	user: AdminUserEntity
}
