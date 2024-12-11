import { Request } from 'express'

import {
	ApiErrorResponse,
	ApiSuccessResponse,
	AuthenticatedGuard,
	CacheService,
	LocalGuard,
	User,
} from '@/common'
import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common'
import { AdminUserEntity } from '@/entity'
import { LoginDTO, LoginResultDTO, LogoutResultDTO } from './dto'

@Controller('admin')
export class AuthController {
	constructor(private readonly cacheService: CacheService) {}

	@Post('login')
	@UseGuards(LocalGuard)
	@ApiSuccessResponse(201, LoginResultDTO)
	@ApiErrorResponse(401)
	login(@User() user: Express.User, @Body() _body: LoginDTO) {
		return new LoginResultDTO({ message: 'Logged in successfully', user })
	}

	@Post('logout')
	@ApiSuccessResponse(201, LogoutResultDTO)
	@ApiErrorResponse(401)
	logout(@Req() req: Request) {
		if (!req.user?.id) {
			throw new UnauthorizedException()
		}
		req.logout(() => {
			return { message: 'Logged out successfully' }
		})
	}

	@Get('me')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, AdminUserEntity)
	profile(@User() user: Express.User) {
		return new AdminUserEntity(user)
	}
}
