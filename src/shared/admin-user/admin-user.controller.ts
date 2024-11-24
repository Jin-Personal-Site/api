import { PrismaService } from '@/common'
import { Controller, Get } from '@nestjs/common'

@Controller('admin/user')
export class AdminUserController {
	constructor(private readonly prisma: PrismaService) {}

	@Get()
	async getAllAdminUser() {
		return await this.prisma.adminUser.findMany()
	}
}
