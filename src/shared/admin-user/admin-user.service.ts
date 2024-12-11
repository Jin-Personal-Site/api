import { PrismaService } from '@/common'
import { Injectable } from '@nestjs/common'
import { AdminUser } from '@prisma/client'

@Injectable()
export class AdminUserService {
	constructor(private readonly prisma: PrismaService) {}

	async getAllAdminUser(): Promise<AdminUser[]> {
		return await this.prisma.adminUser.findMany()
	}
}
