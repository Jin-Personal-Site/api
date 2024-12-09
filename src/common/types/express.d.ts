import { AdminUserEntity } from '@/entity'

export declare global {
	namespace Express {
		interface Request {
			user: User
			logout: (cb: () => void) => void
			isAuthenticated: () => boolean
		}
		type User = AdminUserEntity
	}
}
