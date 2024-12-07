import { AuthenticatedGuard, DayCacheTTL, PrismaService } from '@/common'
import { AdminUserEntity } from '@/entity'
import { Controller, Get, UseGuards } from '@nestjs/common'

@Controller('admin/user')
@DayCacheTTL()
@UseGuards(AuthenticatedGuard)
export class AdminUserController {
	constructor(private readonly prisma: PrismaService) {}

	@Get('all')
	@UseGuards(AuthenticatedGuard)
	async getAllAdminUser() {
		const users = await this.prisma.adminUser.findMany()
		return { users: users.map((user) => new AdminUserEntity(user)) }
	}
}
