import { RedisStore, redisStore } from 'cache-manager-redis-yet'

import {
	CacheModuleOptions,
	CacheOptionsFactory,
	CacheStore,
} from '@nestjs/cache-manager'
import { Injectable, Logger } from '@nestjs/common'

import { AppConfigService } from './config.service'

@Injectable()
export class RedisConfigService implements CacheOptionsFactory {
	public store: RedisStore
	constructor(private readonly configService: AppConfigService) {}

	async createCacheOptions(): Promise<CacheModuleOptions> {
		this.store = await redisStore({
			socket: this.configService.getCacheConfig(),
			keyPrefix: 'nest-app',
		})

		Logger.log('Redis store is used by Cache manager', 'RedisClient')

		return {
			isGlobal: true,
			store: this.store as unknown as CacheStore,
			ttl: 5 * 60000, // 3 minutes
			refreshThreshold: 30000, // 30 seconds
		}
	}
}
