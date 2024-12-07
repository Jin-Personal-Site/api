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
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT,
		},
	}) as const

export type EnvConfigType = ReturnType<typeof envConfig>
