import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const User = createParamDecorator(
	(data: unknown, ctx: ExecutionContext): Record<any, any> => {
		const request = ctx.switchToHttp().getRequest<Request>()
		return request.user
	},
)
