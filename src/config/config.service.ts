import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvConfigType, Environment } from './env'

@Injectable()
export class AppConfigService {
	constructor(
		public readonly configService: ConfigService<EnvConfigType, true>,
	) {}

	isProduction(): boolean {
		return (
			this.configService.get('server.nodeEnv', { infer: true }) ===
			Environment.Production
		)
	}

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

	getMinioConfig() {
		return this.configService.get('minio', { infer: true })
	}

	getStorageBucketName() {
		return this.configService.get('storage.bucket', { infer: true })
	}

	getAwsConfig() {
		return this.configService.get('aws', { infer: true })
	}
}
