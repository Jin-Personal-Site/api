import { Injectable } from '@nestjs/common'
import { ConfigService, Path, PathValue } from '@nestjs/config'
import { EnvConfigType, Environment } from './env'

@Injectable()
export class AppConfigService {
	constructor(
		public readonly configService: ConfigService<EnvConfigType, true>,
	) {}

	get<T extends Path<EnvConfigType>>(
		propertyPath: T,
	): PathValue<EnvConfigType, T> {
		return this.configService.get(propertyPath, {
			infer: true,
		})
	}

	isProduction(): boolean {
		return (
			this.configService.get('server.nodeEnv', { infer: true }) ===
			Environment.Production
		)
	}

	isHttpsAdmin(): boolean {
		return this.configService
			.get('adminUrl', { infer: true })
			?.startsWith('https')
	}

	isTesting(): boolean {
		return (
			this.configService.get('server.nodeEnv', { infer: true }) ===
			Environment.Testing
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
