import { Cache, Milliseconds } from 'cache-manager'
import { min } from 'lodash'

import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'

@Injectable()
export class CacheService {
	public static NO_LIMIT = 0
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
		this.cacheManager.reset().then(() => {
			Logger.log('Reset cache', 'CacheManager')
		})
	}

	async get<T = any>(key: string) {
		return await this.cacheManager.get<T>(key)
	}

	async mget<T = any>(keys: string[]): Promise<T[]> {
		return (await this.cacheManager.store.mget(...keys)) as T[]
	}

	async getKeys(pattern: string) {
		return await this.cacheManager.store.keys(pattern)
	}

	async set<T = any>(key: string, value: T, ttl: Milliseconds[] = []) {
		ttl = ttl.filter((v) => v >= 0)
		ttl.push(1000 * 60 * 60)

		await this.cacheManager.set(key, value, min(ttl))
	}

	async mset(
		keyValuePairs: Array<[string, unknown]>,
		ttl: Milliseconds[] = [],
	) {
		ttl = ttl.filter((v) => v >= 0)
		ttl.push(1000 * 60 * 60)

		return await this.cacheManager.store.mset(keyValuePairs, min(ttl))
	}

	async del(key: string) {
		await this.cacheManager.del(key)
	}

	async mdel(keys: string[]) {
		await this.cacheManager.store.mdel(...keys)
	}

	async reset() {
		await this.cacheManager.reset()
	}

	async ttl(key: string) {
		return await this.cacheManager.store.ttl(key)
	}
}
