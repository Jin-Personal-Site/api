import { Global, Module } from '@nestjs/common'
import { AuthController } from './auth'
import { AppConfigService } from '@/config'
import { BaseStorage, MinioService, S3Service } from './storage/providers'
import { StorageController } from './storage'
import { CacheModule } from '@nestjs/cache-manager'
import { RedisStoreFactory } from './cache'

@Global()
@Module({
	imports: [
		CacheModule.registerAsync({
			isGlobal: true,
			useClass: RedisStoreFactory,
		}),
	],
	controllers: [AuthController, StorageController],
	providers: [
		{
			provide: 'STORAGE',
			inject: [AppConfigService],
			useFactory(configService: AppConfigService): BaseStorage {
				return configService.isProduction()
					? new S3Service(configService)
					: new MinioService(configService)
			},
		},
	],
	exports: ['STORAGE'],
})
export class BaseModule {}
