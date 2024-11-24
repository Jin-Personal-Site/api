import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { applyMiddleware } from './common'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.setGlobalPrefix('api')
	applyMiddleware(app)

	await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
