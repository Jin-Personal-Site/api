export const envConfig = () =>
	({
		server: {
			nodeEnv: process.env.NODE_ENV,
			port: process.env.PORT || 3000,
		},
		adminUrl: process.env.ADMIN_URL,
		webUrl: process.env.WEB_URL,
		database: {
			url: process.env.DATABASE_URL,
		},
		redis: {
			enableCache: process.env.CACHE_ENABLE,
			host: process.env.REDIS_HOST,
			port: +process.env.REDIS_PORT,
		},
		minio: {
			host: process.env.MINIO_HOST,
			port: +process.env.MINIO_PORT,
			accessKey: process.env.MINIO_ACCESS_KEY,
			secretKey: process.env.MINIO_SECRET_KEY,
		},
		aws: {
			region: process.env.AWS_REGION,
			accessKey: process.env.AWS_ACCESS_KEY_ID,
			secretKey: process.env.AWS_SECRET_ACCESS_KEY,
		},
		storage: {
			bucket: process.env.BUCKET_NAME,
		},
	}) as const

export type EnvConfigType = ReturnType<typeof envConfig>
