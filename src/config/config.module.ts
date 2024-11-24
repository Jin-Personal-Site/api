import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envConfig, validateEnv } from './env'
import { AppConfigService } from './config.service'
import { CacheModule } from '@nestjs/cache-manager'
import { RedisConfigService } from './redis-config.service'

@Global()
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			load: [envConfig],
			validate: validateEnv,
		}),
		CacheModule.registerAsync({
			isGlobal: true,
			useClass: RedisConfigService,
		}),
	],
	providers: [AppConfigService],
	exports: [AppConfigService],
})
export class AppConfigModule {}
