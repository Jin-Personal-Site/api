import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ResponseType<T = any> {
	success: boolean
	data: T
}

@Injectable()
export class TransformInterceptor<T>
	implements NestInterceptor<T, ResponseType<T>>
{
	intercept(
		context: ExecutionContext,
		next: CallHandler<T>,
	): Observable<ResponseType<T>> | Promise<Observable<ResponseType<T>>> {
		return next.handle().pipe(
			map((data) => ({
				success: true,
				data,
			})),
		)
	}
}
