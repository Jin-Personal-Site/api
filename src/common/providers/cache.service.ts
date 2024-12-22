import { Cache, Milliseconds } from 'cache-manager'
import { isNil, min } from 'lodash'

import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { dayjs } from '../helpers'

@Injectable()
export class CacheService {
	public static NO_LIMIT = 0
	logger: Logger
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
		this.logger = new Logger('CacheManager')
		this.reset()
	}

	async get<T = any>(key: string) {
		const cache = await this.cacheManager.get<T>(key)
		if (cache) {
			this.logger.verbose(`Cache USED: "${key}"`)
		}
		return cache
	}

	async mget<T = any>(keys: string[]): Promise<T[]> {
		const caches = (await this.cacheManager.store.mget(...keys)) as T[]
		if (caches.some((v) => v)) {
			this.logger.verbose('Caches USED')
			console.log(
				keys.reduce((cur, key, index) => {
					cur[key] = caches[index]
					return cur
				}, {}),
			)
		}
		return caches
	}

	async getSet<T = any>(
		key: string,
		getterCb: () => T | Promise<T>,
		ttl: Milliseconds[] = [],
	): Promise<T> {
		let data = await this.get<T>(key)
		if (isNil(data)) {
			data = await getterCb()
			await this.set(key, data, ttl)
		}
		return data
	}

	async getKeys(pattern: string) {
		return await this.cacheManager.store.keys(pattern)
	}

	async set<T = any>(key: string, value: T, ttl: Milliseconds[] = []) {
		if (isNil(value)) {
			return
		}

		ttl = ttl.filter((v) => v >= 0)
		ttl.push(dayjs.tz().endOf('D').diff(new Date()))

		await this.cacheManager.set(key, value, min(ttl))

		this.logger.verbose(`Cache SET: "${key}"`)
	}

	async mset(
		keyValuePairs: Array<[string, unknown]>,
		ttl: Milliseconds[] = [],
	) {
		ttl = ttl.filter((v) => v >= 0)
		ttl.push(dayjs.tz().endOf('D').diff(new Date()))

		await this.cacheManager.store.mset(keyValuePairs, min(ttl))

		this.logger.verbose(
			`Caches SET: ${JSON.stringify(keyValuePairs.map(([key]) => key).filter((v) => v))}`,
		)
	}

	async del(key: string) {
		await this.cacheManager.del(key)
		this.logger.verbose(`Cache DELETED: "${key}"`)
	}

	async mdel(keys: string[]) {
		await this.cacheManager.store.mdel(...keys)
		this.logger.verbose(`Caches DELETED: ${JSON.stringify(keys)}`)
	}

	async reset() {
		await this.cacheManager.reset()
		this.logger.verbose(`Cache RESET`)
	}

	async ttl(key: string) {
		return await this.cacheManager.store.ttl(key)
	}

	async delByPrefix(prefix: string) {
		const keys = await this.getKeys(`*${prefix}*`)
		if (keys.length > 0) {
			await this.mdel(keys)
		}
	}
}
