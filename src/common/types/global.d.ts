import { Environment } from '@/config'
import { LogLevel } from '@nestjs/common'
import { AdminUserEntity } from '@/entity'

export declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: Environment
			PORT: number
			DEV_PORT: number
			ADMIN_URL: string
			WEB_URL: string

			DATABASE_URL: string

			CACHE_ENABLE: boolean
			REDIS_HOST: string
			REDIS_PORT: number

			MINIO_HOST: string
			MINIO_PORT: number
			MINIO_ACCESS_KEY: string
			MINIO_SECRET_KEY: string

			AWS_REGION: string
			AWS_ACCESS_KEY_ID: string
			AWS_SECRET_ACCESS_KEY: string

			BUCKET_NAME: string

			LOG_LEVEL: LogLevel

			ESLINT_USE_FLAT_CONFIG: boolean
			FORCE_COLOR: boolean
		}
	}
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
