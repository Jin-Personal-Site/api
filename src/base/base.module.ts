import { Global, Module } from '@nestjs/common'
import { AuthController } from './auth'
import { Environment } from '@/config'
import { MinioService, S3Service } from './storage/providers'
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
			useClass:
				process.env.NODE_ENV === Environment.Production
					? S3Service
					: MinioService,
		},
	],
	exports: ['STORAGE'],
})
export class BaseModule {}
