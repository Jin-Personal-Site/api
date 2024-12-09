import {
	Injectable,
	OnModuleInit,
	OnApplicationShutdown,
	Logger,
} from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'
import * as chalk from 'chalk'

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
				{ emit: 'stdout', level: 'error' },
				{ emit: 'stdout', level: 'warn' },
				// { emit: 'stdout', level: 'info' },
			],
		})

		this.logger = new Logger('PrismaClient')

		this.$on('query', (e: Prisma.QueryEvent) => {
			this.logger.verbose(
				`Query executed - Duration: ${e.duration}ms - Params: ${e.params.toString()}`,
			)
			console.log(chalk.dim(e.query))
		})
	}

	async onModuleInit() {
		await this.$connect()
		this.logger.log('Database connected')
	}

	async onApplicationShutdown() {
		await this.$disconnect()
	}
}
