import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envConfig, validateEnv } from './env'
import { AppConfigService } from './config.service'
import { MyLoggerService } from './logger'

@Global()
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			load: [envConfig],
			validate: validateEnv,
		}),
	],
	providers: [AppConfigService, MyLoggerService],
	exports: [AppConfigService, MyLoggerService],
})
export class AppConfigModule {}
