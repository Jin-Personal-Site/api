import { plainToInstance } from 'class-transformer'
import {
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUrl,
	Max,
	Min,
	validateSync,
} from 'class-validator'

enum Environment {
	Development = 'development',
	Production = 'production',
	Test = 'test',
	Provision = 'provision',
}

export class EnvironmentVariables {
	@IsEnum(Environment)
	@IsOptional()
	NODE_ENV?: Environment = Environment.Development

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

	@IsString()
	REDIS_HOST: string

	@IsNumber()
	@Min(0)
	@Max(65535)
	REDIS_PORT: number
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
