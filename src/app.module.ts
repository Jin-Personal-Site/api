import {
	ClassSerializerInterceptor,
	Module,
	ValidationPipe,
} from '@nestjs/common'
import { AppController } from './app.controller'
import {
	CommonModule,
	HttpExceptionFilter,
	PrismaClientErrorFilter,
	TransformInterceptor,
	ValidationErrorFilter,
	ValidationGroupError,
} from './common'

import { AuthModule } from './auth'
import { AppConfigModule } from './config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { BaseModule } from './base'
import {
	AdminUserModule,
	CategoryModule,
	PostModule,
	SeriesModule,
} from './shared'

@Module({
	imports: [
		AppConfigModule,
		CommonModule,
		BaseModule,
		AuthModule,
		AdminUserModule,
		CategoryModule,
		PostModule,
		SeriesModule,
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: TransformInterceptor,
		},
		{
			provide: APP_FILTER,
			useClass: PrismaClientErrorFilter,
		},
		{
			provide: APP_FILTER,
			useClass: ValidationErrorFilter,
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ClassSerializerInterceptor,
		},
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe({
				transform: true,
				exceptionFactory: (errors) => new ValidationGroupError(errors),
			}),
		},
	],
})
export class AppModule {}
