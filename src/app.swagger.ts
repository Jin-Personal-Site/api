import { INestApplication } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

export const enableSwagger = (app: INestApplication) => {
	const config = new DocumentBuilder()
		.setTitle('Personal Site API')
		.setVersion('1.0')
		.build()
	const documentFactory = () => SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('swagger', app, documentFactory)
}
