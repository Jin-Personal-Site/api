import { BaseEntity } from '@/entity'

type LoginResult = {
	message: string
}

export class LogoutResultDTO
	extends BaseEntity<LoginResult>
	implements LoginResult
{
	message: string
}
