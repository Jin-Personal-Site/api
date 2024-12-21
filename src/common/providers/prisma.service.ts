import {
	Injectable,
	OnModuleInit,
	OnApplicationShutdown,
	Logger,
} from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
	extends PrismaClient<
		Prisma.PrismaClientOptions,
		Prisma.LogLevel | Prisma.LogDefinition
	>
	implements OnModuleInit, OnApplicationShutdown
{
	logger: Logger
	constructor() {
		super({
			log: [
				{ emit: 'event', level: 'query' },
				{ emit: 'stdout', level: 'warn' },
			],
		})

		this.logger = new Logger('PrismaClient')

		this.$on('query', (e: Prisma.QueryEvent) => {
			this.logger.debug(
				`Query executed - Duration: ${e.duration}ms - Params: ${e.params.toString()}\n${e.query}`,
			)
		})
		this.$on('warn', (e: Prisma.LogEvent) => {
			this.logger.warn(`Target ${e.target}: ${e.message}`)
		})
	}

	async onModuleInit() {
		await this.$connect()
		this.logger.log(
			`Database connected. PrismaClient version: ${Prisma.prismaVersion.client}`,
		)
	}

	async onApplicationShutdown() {
		await this.$disconnect()
	}
}
