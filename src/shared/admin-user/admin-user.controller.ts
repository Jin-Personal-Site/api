import { ApiSuccessResponse, AuthenticatedGuard, DayCacheTTL } from '@/common'
import { Controller, Get, UseGuards } from '@nestjs/common'
import { AdminUserService } from './admin-user.service'
import { AllAdminUsersOutputDTO } from './dto'
import { plainToInstance } from 'class-transformer'

@Controller('admin/user')
@DayCacheTTL()
@UseGuards(AuthenticatedGuard)
export class AdminUserController {
	constructor(private readonly adminUserService: AdminUserService) {}

	@Get('all')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, AllAdminUsersOutputDTO, true)
	async getAllAdminUser() {
		const users = await this.adminUserService.getAllAdminUser()
		// return new AllAdminUsersOutputDTO({ users })
		return plainToInstance(AllAdminUsersOutputDTO, { users })
	}
}
