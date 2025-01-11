import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { middlewares } from './app.middleware'
import { AppConfigService, MyLoggerService } from './config'
import { enableSwagger } from './app.swagger'
import { readFileSync } from 'fs'

const httpsOptions = {
	key: readFileSync('./secrets/private-key.pem'),
	cert: readFileSync('./secrets/public-certificate.pem'),
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { httpsOptions })
	const configService = app.get(AppConfigService)

	app.setGlobalPrefix('api')
	app.useLogger(app.get(MyLoggerService))
	app.enableCors({
		origin: configService.get('adminUrl'),
		credentials: true,
		allowedHeaders: 'content-type',
		methods: '*',
	})

	middlewares(app)
	if (!configService.isProduction()) {
		enableSwagger(app)
	}

	await app.listen(configService.get('server.port'))
}
bootstrap()
