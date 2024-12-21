import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
	Logger,
} from '@nestjs/common'
import {
	PrismaClientInitializationError,
	PrismaClientKnownRequestError,
	PrismaClientRustPanicError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError,
} from '@prisma/client/runtime/library'
import { Request, Response } from 'express'
import { ErrorResponse, getErrorCode } from '../types'
import { getHttpMetadata } from '../helpers'

@Catch(
	PrismaClientInitializationError,
	PrismaClientKnownRequestError,
	PrismaClientRustPanicError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError,
)
export class PrismaClientErrorFilter implements ExceptionFilter {
	catch(exception: Error, host: ArgumentsHost) {
		const request = host.switchToHttp().getRequest<Request>()
		const response = host.switchToHttp().getResponse<Response>()
		const statusCode = HttpStatus.INTERNAL_SERVER_ERROR

		const errorMessagePrefix = `${request.user?.id ? `[userID:${request.user?.id}] | ` : ''}[requestID:${request.id}] | ${request.method.toUpperCase()} ${request.url}`

		response.status(statusCode).json({
			success: false,
			error: {
				code: getErrorCode(statusCode),
			},
			meta: getHttpMetadata(request),
		} as ErrorResponse)

		this.doErrorTask(exception, errorMessagePrefix)
	}

	private doErrorTask(exception: Error, errorMessagePrefix: string) {
		let message = errorMessagePrefix
		if (exception instanceof PrismaClientKnownRequestError) {
			message += `\nERROR_CODE: ${exception.code}. METADATA: ${JSON.stringify(exception.meta)}`
		} else if (exception instanceof PrismaClientUnknownRequestError) {
			message += `\n${exception.message}`
		} else if (exception instanceof PrismaClientRustPanicError) {
			message += `\n${exception.message}`
		} else if (exception instanceof PrismaClientInitializationError) {
			message += `\n${exception.message}\nERROR_CODE: ${exception.errorCode}\n`
		} else if (exception instanceof PrismaClientValidationError) {
			message += `\n${exception.message}`
		}
		Logger.error(message, exception.stack, exception.name)
	}
}
