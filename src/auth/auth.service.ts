import { PrismaService } from '@/common'
import { BadRequestException, Injectable } from '@nestjs/common'
import { HashService } from './hash.service'
import { AdminUserEntity } from '@/entity'

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly hashService: HashService,
	) {}

	async validateAdminUser(username: string, password: string) {
		const user = await this.prisma.adminUser.findUnique({
			where: {
				username,
			},
		})

		if (!user) {
			throw new BadRequestException('Username does not exist')
		}
		const { password: hash } = user
		if (this.hashService.compare(password, hash)) {
			return new AdminUserEntity(user)
		}
		throw new BadRequestException('Password is not matched')
	}
}
