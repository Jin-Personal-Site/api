import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { middlewares } from './app.middleware'
import { AppConfigService, Environment, MyLoggerService } from './config'
import { existsSync, readFileSync } from 'fs'
import { Logger, NestApplicationOptions } from '@nestjs/common'

const httpsOptions: NestApplicationOptions['httpsOptions'] = ((
	nodeEnv: Environment,
) => {
	if (
		nodeEnv === Environment.Development &&
		existsSync('./secrets/key.pem') &&
		existsSync('./secrets/cert.pem')
	) {
		return {
			key: readFileSync('./secrets/key.pem'),
			cert: readFileSync('./secrets/cert.pem'),
		}
	}
	return undefined
})(process.env.NODE_ENV)

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		httpsOptions,
	})
	const configService = app.get(AppConfigService)

	app.setGlobalPrefix('api')
	app.useLogger(app.get(MyLoggerService))
	app.enableCors({
		origin: configService.get('adminUrl'),
		// origin: 'http://127.0.0.1:53831',
		credentials: true,
		allowedHeaders: 'content-type',
		methods: '*',
	})

	middlewares(app)
	if (!configService.isProduction()) {
		import('./app.swagger').then(({ enableSwagger }) => {
			enableSwagger(app)
		})
	}

	const port = configService.getAppPort()
	Logger.verbose(
		`Server listening at http${httpsOptions ? 's' : ''}://localhost:${port}`,
		'NestApplication',
	)
	await app.listen(port)
}
bootstrap()
