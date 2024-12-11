import { Environment } from '@/config'

export declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: Environment
			PORT: number
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

			ESLINT_USE_FLAT_CONFIG: boolean
			FORCE_COLOR: boolean
		}
	}
}
