import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { SuccessResponse } from '../types'

@Injectable()
export class TransformInterceptor<T>
	implements NestInterceptor<T, SuccessResponse<T>>
{
	intercept(
		context: ExecutionContext,
		next: CallHandler<T>,
	): Observable<SuccessResponse<T>> | Promise<Observable<SuccessResponse<T>>> {
		return next.handle().pipe(
			map((data) => ({
				success: true,
				data,
			})),
		)
	}
}
