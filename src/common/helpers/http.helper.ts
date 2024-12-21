import { Request } from 'express'
import { ResponseMetaData } from '../types'

export const getHttpMetadata = (request: Request): ResponseMetaData => {
	return {
		requestId: request.id,
		timestamp: request.requestTime.toISOString(),
		auth: {
			authenticatedUser: request.user?.username ?? null,
			roles: request.user?.role ?? null,
		},
	}
}
