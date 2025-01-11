import * as compression from 'compression'
import RedisStore from 'connect-redis'
import * as session from 'express-session'
import * as morgan from 'morgan'
import * as passport from 'passport'
import { createClient } from 'redis'

import { AppConfigService } from '@/config'
import { INestApplication, Logger } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { NextFunction, Request, Response } from 'express'

function getRedisStore(config: { host: string; port: number }) {
	// Initialize client.
	const redisClient = createClient({
		socket: { host: config.host, port: config.port },
		database: 1,
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

const generateRequestIDMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const requestId = uuidv4()
	req.id = requestId
	req.requestTime = new Date()
	res.setHeader('X-Request-Id', requestId)
	next()
}

export const middlewares = (app: INestApplication) => {
	const appConfigService = app.get(AppConfigService)

	app.use(generateRequestIDMiddleware)
	app.use(compression({ threshold: 0 }))
	app.use(
		session({
			store: getRedisStore(appConfigService.getCacheConfig()),
			secret: 'my-session-secret',
			resave: false,
			saveUninitialized: false,
			cookie: {
				maxAge: 3600000,
				httpOnly: true,
				sameSite: 'none',
				secure:
					appConfigService.isHttpsAdmin() || appConfigService.isProduction(),
				priority: 'high',
				signed: true,
			},
			rolling: true,
		}),
	)
	app.use(passport.initialize())
	app.use(passport.session())
	app.use(morgan('dev'))
}
