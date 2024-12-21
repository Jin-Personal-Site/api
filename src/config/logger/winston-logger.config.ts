import 'winston-daily-rotate-file'
import * as winston from 'winston'

const winstonLogFormatForFile = winston.format.combine(
	winston.format.timestamp({
		format: 'YYYY-MM-DD HH:mm:ss.SSSZZ',
	}),
	winston.format.printf(
		(info) =>
			`[${new Date(info.timestamp as string).toISOString()}]  ${info.level.toUpperCase()}  | ${info.message}`,
	),
)

const fileRotateErrorTransport = new winston.transports.DailyRotateFile({
	filename: '%DATE%.log',
	dirname: 'storage/logs',
	datePattern: 'YYYY-MM-DD',
	maxFiles: '30d',
	zippedArchive: true,
	json: true,
	format: winstonLogFormatForFile,
	handleExceptions: true,
	handleRejections: true,
})

export const winstonOptions: winston.LoggerOptions = {
	transports: [fileRotateErrorTransport],
	level: 'debug',
}
