import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvConfigType } from './env'

@Injectable()
export class AppConfigService {
	constructor(
		private readonly configService: ConfigService<EnvConfigType, true>,
	) {}

	getAdminUrl(): string {
		return this.configService.get('adminUrl', { infer: true })
	}

	getWebUrl(): string {
		return this.configService.get('webUrl', { infer: true })
	}

	getCacheConfig() {
		return {
			host: this.configService.get('redis.host', { infer: true }),
			port: this.configService.get('redis.port', { infer: true }),
		}
	}
}
