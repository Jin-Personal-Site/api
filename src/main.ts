import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { middlewares } from './app.middleware'
import { AppConfigService } from './config'
import { enableSwagger } from './app.swagger'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: true,
	})
	const configService = app.get(AppConfigService)

	app.setGlobalPrefix('api')

	middlewares(app)
	if (!configService.isProduction()) {
		enableSwagger(app)
	}

	await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
