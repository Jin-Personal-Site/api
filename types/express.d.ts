export declare global {
	namespace Express {
		interface Request {
			user: Record<any, any>
			logout: (cb: () => void) => void
			isAuthenticated: () => boolean
		}
		enum UserRole {
			ADMIN = 'ADMIN',
			EDITOR = 'EDITOR',
		}
		type User = {
			id: number
			username: string
			name: string
			role: UserRole
		}
	}
}
