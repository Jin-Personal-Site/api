import { AdminUserEntity } from '@/entity'
import { Type } from 'class-transformer'

export class LoginResultDTO {
	message: string

	@Type(() => AdminUserEntity)
	user: AdminUserEntity
}
