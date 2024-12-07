import { AppConfigService } from '@/config'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import * as Minio from 'minio'
import {
	BaseStorage,
	GetObjectParam,
	IStorage,
	PutObjectParam,
	PutObjectResult,
} from './storage.interface'

@Injectable()
export class MinioService
	extends BaseStorage
	implements IStorage, OnModuleInit
{
	public minioClient: Minio.Client
	public bucketName: string

	constructor(private readonly configService: AppConfigService) {
		super()

		this.minioClient = new Minio.Client({
			endPoint: process.env.MINIO_HOST,
			port: +process.env.MINIO_PORT,
			useSSL: false,
			accessKey: process.env.MINIO_ACCESS_KEY,
			secretKey: process.env.MINIO_SECRET_KEY,
		})
		this.bucketName = process.env.AWS_PUBLIC_BUCKET_NAME
	}

	onModuleInit() {
		Logger.log('Minio storage connected', 'MinioClient')
	}

	async getObject(options: GetObjectParam) {
		const { key, bucketName } = options

		const dataStream = await this.minioClient.getObject(
			bucketName || this.bucketName,
			key,
		)
		const chunks: Buffer[] = []
		dataStream.on('data', (chunk: Buffer) => {
			chunks.push(chunk)
		})

		return new Promise<Uint8Array>((resolve, reject) => {
			dataStream.on('end', () => {
				resolve(Buffer.concat(chunks))
			})
			dataStream.on('error', (err) => {
				reject(err)
			})
		})
	}

	async putObject(options: PutObjectParam): Promise<PutObjectResult> {
		const { bucketName, file, prefix = '' } = options
		const fileKey = options.useOriginalName
			? file.originalname
			: prefix + this.uniqueFileName(file)

		await this.minioClient.putObject(
			bucketName || this.bucketName,
			fileKey,
			file.buffer,
			file.size,
			{
				'Content-Type': file.mimetype,
			},
		)

		return {
			objectKey: fileKey,
		}
	}
}
