import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { middlewares } from './app.middleware'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: true,
		bodyParser: true,
	})

	app.setGlobalPrefix('api')
	middlewares(app)

	await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
