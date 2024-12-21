import { LogLevel } from '@nestjs/common'
import { plainToInstance, Type } from 'class-transformer'
import {
	IsBoolean,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUrl,
	Max,
	Min,
	validateSync,
} from 'class-validator'

export enum Environment {
	Development = 'development',
	Production = 'production',
	Testing = 'test',
}

export class EnvironmentVariables {
	@IsEnum(Environment)
	@IsOptional()
	NODE_ENV?: Environment = Environment.Development

	@Type(() => Number)
	@IsNumber()
	@Min(0)
	@Max(65535)
	@IsOptional()
	PORT?: number = 3000

	@IsUrl({
		require_tld: false,
	})
	ADMIN_URL: string

	@IsUrl({
		require_tld: false,
	})
	WEB_URL: string

	@IsString()
	DATABASE_URL: string

	@Type(() => Boolean)
	@IsBoolean()
	CACHE_ENABLE: boolean

	@IsString()
	REDIS_HOST: string

	@Type(() => Number)
	@IsNumber()
	@Min(0)
	@Max(65535)
	REDIS_PORT: number

	@IsString()
	MINIO_HOST: string

	@Type(() => Number)
	@IsNumber()
	@Min(0)
	@Max(65535)
	MINIO_PORT: number

	@IsString()
	MINIO_ACCESS_KEY: string

	@IsString()
	MINIO_SECRET_KEY: string

	@IsString()
	AWS_REGION: string

	@IsString()
	AWS_ACCESS_KEY_ID: string

	@IsString()
	AWS_SECRET_ACCESS_KEY: string

	@IsString()
	BUCKET_NAME: string

	@IsString()
	LOG_LEVEL: LogLevel = 'log'

	@Type(() => Boolean)
	@IsBoolean()
	ESLINT_USE_FLAT_CONFIG: boolean

	@Type(() => Boolean)
	@IsBoolean()
	FORCE_COLOR: boolean
}

export function validateEnv(config: Record<string, unknown>) {
	const validatedConfig = plainToInstance(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	})
	const errors = validateSync(validatedConfig, { skipMissingProperties: false })

	if (errors.length > 0) {
		throw new Error(errors.toString())
	}
	return validatedConfig
}
