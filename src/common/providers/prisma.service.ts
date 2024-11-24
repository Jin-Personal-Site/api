import {
	Injectable,
	OnModuleInit,
	OnApplicationShutdown,
	Logger,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnApplicationShutdown
{
	async onModuleInit() {
		await this.$connect()
		Logger.log('Database connected', 'PrismaClient')
	}

	async onApplicationShutdown() {
		await this.$disconnect()
	}
}
