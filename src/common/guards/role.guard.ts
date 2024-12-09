import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { Request } from 'express'

@Injectable()
export class AdminOnlyGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>()
		return request.user?.role === Role.ADMIN
	}
}
