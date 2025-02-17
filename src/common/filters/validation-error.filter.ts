import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common'
import { ValidationError } from 'class-validator'
import { Request, Response } from 'express'
import { ErrorResponse, getErrorCode, ValidationErrorDetail } from '../types'
import { getHttpMetadata } from '../helpers'

export class ValidationGroupError implements Error {
	name: string
	message: string
	stack?: string
	cause?: unknown
	errors: ValidationError[]

	constructor(errors: ValidationError[]) {
		this.errors = errors
		this.name = 'ValidationGroupError'
		this.message = 'message'
	}
}

@Catch(ValidationGroupError, ValidationError)
export class ValidationErrorFilter implements ExceptionFilter {
	catch(
		exception: ValidationGroupError | ValidationError,
		host: ArgumentsHost,
	) {
		const errors: ValidationError[] =
			exception instanceof ValidationError ? [exception] : exception.errors

		const request = host.switchToHttp().getRequest<Request>()
		const response = host.switchToHttp().getResponse<Response>()
		const statusCode = HttpStatus.BAD_REQUEST

		response.status(statusCode).json({
			success: false,
			error: {
				code: getErrorCode(statusCode),
				message: 'Validation failed',
				details: errors.map((error) => ({
					property: error.property,
					value: error.value,
					reason: Object.values(error.constraints ?? {}).map((message) =>
						message.replace(new RegExp(error.property), `$${error.property}`),
					),
				})),
			},
			meta: getHttpMetadata(request),
		} as ErrorResponse<ValidationErrorDetail[]>)
	}
}
