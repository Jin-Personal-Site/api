import { AdminUserEntity } from '@/entity'
import { Type } from 'class-transformer'

export class MeOutputDTO {
	@Type(() => AdminUserEntity)
	user: AdminUserEntity
}
