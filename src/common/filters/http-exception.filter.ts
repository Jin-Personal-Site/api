import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ErrorResponse, getErrorCode } from '../types'
import { getHttpMetadata } from '../helpers'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const request = host.switchToHttp().getRequest<Request>()
		const response = host.switchToHttp().getResponse<Response>()
		const statusCode = exception.getStatus()

		if (!exception.getStatus().toString().startsWith('4')) {
			Logger.error(exception.message, exception.stack, exception.name)
		}

		response.status(statusCode).json({
			success: false,
			error: {
				code: getErrorCode(statusCode),
				message: exception.message,
			},
			meta: getHttpMetadata(request),
		} as ErrorResponse)
	}
}
