import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envConfig, validateEnv } from './env'
import { AppConfigService } from './config.service'

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
	providers: [AppConfigService],
	exports: [AppConfigService],
})
export class AppConfigModule {}
