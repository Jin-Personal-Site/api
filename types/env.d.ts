export declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: string
			PORT: number
			ADMIN_URL: string
			WEB_URL: string
			DATABASE_URL: string
			REDIS_HOST: string
			REDIS_PORT: number
		}
	}
}
