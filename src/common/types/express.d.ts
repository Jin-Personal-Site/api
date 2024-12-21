import { AdminUserEntity } from '@/entity'

export declare global {
	namespace Express {
		interface Request {
			id: string
			requestTime: Date
			user: User
			logout: (cb: () => void) => void
			isAuthenticated: () => boolean
		}
		type User = AdminUserEntity
	}
}
