import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	ForbiddenException,
	HttpException,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { Response } from 'express'
import { ErrorResponse, getErrorCode } from '../types'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<Response>()
		const statusCode = exception.getStatus()

		if (
			!(
				[NotFoundException, ForbiddenException, UnauthorizedException] as const
			).some((Class) => exception instanceof Class)
		) {
			Logger.error(exception.message, exception.stack, exception.name)
		}

		response.status(statusCode).json({
			success: false,
			error: {
				code: getErrorCode(statusCode),
				message: exception.message,
			},
		} as ErrorResponse)
	}
}
