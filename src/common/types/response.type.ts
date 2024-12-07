import { HttpException, HttpStatus } from '@nestjs/common'
import { snakeCase } from 'lodash'

export type ResponseMetaData = {
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

export type SuccessResponse<T = any> = {
	success: true
	data: T
	meta?: ResponseMetaData
}

export type ErrorResponse<T = any> = {
	success: false
	error: {
		code: string
		message: string
		details?: T
	}
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
