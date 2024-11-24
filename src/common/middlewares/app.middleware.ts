import * as compression from 'compression'
import RedisStore from 'connect-redis'
import * as session from 'express-session'
import * as morgan from 'morgan'
import * as passport from 'passport'
import { createClient } from 'redis'

import { AppConfigService } from '@/config'
import { INestApplication, Logger } from '@nestjs/common'

function getRedisStore(config: { host: string; port: number }) {
	// Initialize client.
	const redisClient = createClient({
		socket: { host: config.host, port: config.port },
	})
	redisClient
		.connect()
		.then(() => {
			Logger.log('Redis store is used by Session', 'RedisClient')
		})
		.catch((reason) => {
			Logger.error(
				`Redis isn't used by Session: ${reason?.message ?? reason}`,
				'RedisClient',
			)
		})

	// Initialize store.
	const redisStore = new RedisStore({
		client: redisClient,
		prefix: 'express-session:',
	})

	return redisStore
}

export const applyMiddleware = (app: INestApplication) => {
	const appConfigService = app.get(AppConfigService)

	app.use(compression())
	app.use(
		session({
			store: getRedisStore(appConfigService.getCacheConfig()),
			secret: 'my-session-secret',
			resave: false,
			saveUninitialized: false,
			cookie: {
				maxAge: 3600000,
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
			},
			rolling: true,
		}),
	)
	app.use(passport.initialize())
	app.use(passport.session())
	app.use(morgan('dev'))
}
