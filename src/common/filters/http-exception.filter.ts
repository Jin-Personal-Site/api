import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	Logger,
} from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const context = host.switchToHttp()
		const response = context.getResponse<Response>()
		const statusCode = exception.getStatus()

		Logger.error(exception.message, exception.stack, exception.name)

		response.status(statusCode).json({
			success: false,
			message: exception.message,
		})
	}
}
