import { CacheService, PrismaService } from '@/common'
import { BadRequestException, Injectable } from '@nestjs/common'
import { HashService } from './hash.service'
import { AdminUserEntity } from '@/entity'
import { getCacheKey } from '@/base'
import { AdminUser } from '@prisma/client'

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cache: CacheService,
		private readonly hashService: HashService,
	) {}

	async validateAdminUser(username: string, password: string) {
		const cacheKey = getCacheKey.auth.username(username)

		let user = await this.cache.get<AdminUser>(cacheKey)
		if (!user) {
			user = await this.prisma.adminUser.findUnique({
				where: {
					username,
				},
			})
			this.cache.set(cacheKey, user)
		}

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
