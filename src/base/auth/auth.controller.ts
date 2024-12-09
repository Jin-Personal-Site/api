import { Request } from 'express'

import { AuthenticatedGuard, CacheService, LocalGuard, User } from '@/common'
import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common'
import { AdminUserEntity } from '@/entity'
import { LoginDTO } from './dto'

@Controller('admin')
export class AuthController {
	constructor(private readonly cacheService: CacheService) {}

	@Post('login')
	@UseGuards(LocalGuard)
	login(@User() user: Express.User, @Body() _body: LoginDTO) {
		return { message: 'Logged in successfully', user }
	}

	@Post('logout')
	logout(@Req() req: Request) {
		if (!req.user?.id) {
			throw new BadRequestException()
		}
		req.logout(() => {
			return { message: 'Logged out successfully' }
		})
	}

	@Get('me')
	@UseGuards(AuthenticatedGuard)
	profile(@User() user: Express.User) {
		return new AdminUserEntity(user)
	}
}
