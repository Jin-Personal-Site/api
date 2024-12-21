import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { middlewares } from './app.middleware'
import { AppConfigService, MyLoggerService } from './config'
import { enableSwagger } from './app.swagger'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const configService = app.get(AppConfigService)

	app.setGlobalPrefix('api')
	app.useLogger(app.get(MyLoggerService))

	middlewares(app)
	if (!configService.isProduction()) {
		enableSwagger(app)
	}

	await app.listen(configService.get('server.port'))
}
bootstrap()
