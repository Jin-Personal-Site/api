import { Request } from 'express'

import { AuthenticatedGuard, CacheService, LocalGuard, User } from '@/common'
import {
	BadRequestException,
	Controller,
	Get,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common'

export enum AUTH_CACHE_KEY {
	ME = 'admin/me-',
}

@Controller('admin')
export class AuthController {
	constructor(private readonly cacheService: CacheService) {}

	@Post('login')
	@UseGuards(LocalGuard)
	login(@User() user: Express.User) {
		this.cacheService.del(AUTH_CACHE_KEY.ME + user.id)
		return { message: 'Logged in successfully', user }
	}

	@Post('logout')
	logout(@Req() req: Request) {
		if (!req.user?.id) {
			throw new BadRequestException()
		}
		this.cacheService.del(AUTH_CACHE_KEY.ME + req.user.id)
		req.logout(() => {
			return { message: 'Logged out successfully' }
		})
	}

	@UseGuards(AuthenticatedGuard)
	@Get('me')
	profile(@User() user: Express.User) {
		return { user }
	}
}
