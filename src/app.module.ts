import { Module, ValidationPipe } from '@nestjs/common'
import { AppController } from './app.controller'
import {
	CommonModule,
	HttpExceptionFilter,
	TransformInterceptor,
} from './common'
import { AdminUserModule } from './shared/admin-user'
import { AuthModule } from './auth'
import { AppConfigModule } from './config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { CacheInterceptor } from '@nestjs/cache-manager'

@Module({
	imports: [CommonModule, AppConfigModule, AdminUserModule, AuthModule],
	controllers: [AppController],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: TransformInterceptor,
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: CacheInterceptor,
		},
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe({ transform: true }),
		},
	],
})
export class AppModule {}
