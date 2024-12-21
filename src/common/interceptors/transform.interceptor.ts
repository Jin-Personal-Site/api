import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { SuccessResponse } from '../types'
import { Request } from 'express'
import { getHttpMetadata } from '../helpers'

@Injectable()
export class TransformInterceptor<T>
	implements NestInterceptor<T, SuccessResponse<T>>
{
	intercept(
		context: ExecutionContext,
		next: CallHandler<T>,
	): Observable<SuccessResponse<T>> | Promise<Observable<SuccessResponse<T>>> {
		const request = context.switchToHttp().getRequest<Request>()
		return next.handle().pipe(
			map(
				(data): SuccessResponse => ({
					success: true,
					data,
					meta: getHttpMetadata(request),
				}),
			),
		)
	}
}
