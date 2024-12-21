import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { snakeCase } from 'lodash'

export class ResponseMetaData {
	requestId?: string
	timestamp?: string
	pagination?: {
		page: number
		perPage: number
		totalPages: number
		totalItems: number
	}
	rateLimit?: {
		limit: number
		remaining: number
		resetAt: string
	}
	performance?: {
		processingTime: number
		dbQueryTime: number
		cacheHit: boolean
	}
	apiVersion?: string
	auth?: {
		authenticatedUser: string
		roles: string
	}
}

export class SuccessResponse<T = any> {
	@ApiProperty()
	success: true

	@ApiProperty()
	data: T

	@ApiProperty()
	meta?: ResponseMetaData
}

export class ValidationErrorDetail {
	@ApiProperty()
	property: string

	@ApiProperty({ example: 0 })
	value: any

	@ApiProperty()
	reason: string[]
}

export class ErrorDetail<T = any> {
	@ApiProperty()
	code: string

	@ApiProperty()
	message: string

	@ApiProperty({ required: false })
	details?: T
}

export class ErrorResponse<T = any> {
	@ApiProperty({ example: false })
	success: false

	@ApiProperty({ type: () => ErrorDetail })
	error: ErrorDetail<T>

	// TODO: Remove ApiHideProperty after its logic prepared
	@ApiHideProperty()
	meta?: ResponseMetaData
}

export const errorCode = {
	400: 'INVALID_INPUT',
	401: 'AUTHENTICATION_FAILED',
	403: 'ACCESS_DENIED',
	404: 'RESOURCE_NOT_FOUND',
	500: 'INTERNAL_SERVER_ERROR',
} as const

export const getErrorCode = (statusCode: HttpStatus): string => {
	return (
		errorCode[statusCode] ??
		snakeCase(new HttpException('', statusCode).name).toUpperCase()
	)
}
