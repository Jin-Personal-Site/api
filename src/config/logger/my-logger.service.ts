import { ConsoleLogger, Injectable } from '@nestjs/common'
import { createLogger, Logger as WinstonLogger } from 'winston'
import { winstonOptions } from './winston-logger.config'

type Context = string
type Stack = string

@Injectable()
export class MyLoggerService extends ConsoleLogger {
	private _winstonLogger: WinstonLogger
	private endOfLog = '\n--------------------------'

	private getWinstonLogger() {
		if (!this._winstonLogger) {
			this._winstonLogger = createLogger({
				...winstonOptions,
				levels: {
					fatal: 0,
					error: 1,
					warn: 2,
					info: 3, // use `info` instead of `log` to avoid warning of winston
					verbose: 4,
					debug: 5,
				},
				level: process.env.LOG_LEVEL,
			})
		}
		return this._winstonLogger
	}

	fatal(message: any, context?: Context): void
	fatal(message: any, ...params: [...any, Context?]): void {
		if (!Array.isArray(params)) {
			params = [params]
		}
		super.fatal(message, ...params)
		this.getWinstonLogger().log('fatal', message + this.endOfLog, ...params)
	}

	error(message: any, stackOrContext?: string): void
	error(message: any, ...params: [...any, Stack?, Context?]): void {
		if (!Array.isArray(params)) {
			params = [params]
		}
		super.error(message, ...params)

		this.getWinstonLogger().error(
			`${message}\n${params.slice(0, -1).join('\n')}${this.endOfLog}`,
		)
	}

	warn(message: any, context?: Context): void
	warn(message: any, ...params: [...any, Context?]): void {
		if (!Array.isArray(params)) {
			params = [params]
		}
		super.warn(message, ...params)
		this.getWinstonLogger().log('warn', message + this.endOfLog, ...params)
	}

	log(message: any, context?: Context): void
	log(message: any, ...params: [...any, Context?]): void {
		if (!Array.isArray(params)) {
			params = [params]
		}
		super.log(message, ...params)
		this.getWinstonLogger().log(
			'info',
			message + this.endOfLog,
			this.context,
			...params,
		)
	}

	verbose(message: any, context?: Context): void
	verbose(message: any, ...params: [...any, Context?]): void {
		if (!Array.isArray(params)) {
			params = [params]
		}
		super.verbose(message, ...params)
		this.getWinstonLogger().verbose(message + this.endOfLog, ...params)
	}

	debug(message: any, context?: Context): void
	debug(message: any, ...params: [...any, Context?]): void {
		if (!Array.isArray(params)) {
			params = [params]
		}
		super.debug(message, ...params)
		this.getWinstonLogger().debug(message + this.endOfLog, ...params)
	}
}
