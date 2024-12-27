import { AppConfigService } from '@/config'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import * as Minio from 'minio'
import {
	BaseStorage,
	DeleteObjectParam,
	DeleteObjectsParam,
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
		const { host, port, accessKey, secretKey } =
			this.configService.getMinioConfig()

		this.minioClient = new Minio.Client({
			endPoint: host,
			port,
			useSSL: false,
			accessKey,
			secretKey,
		})
		this.bucketName = this.configService.getStorageBucketName()
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

	async deleteObject(options: DeleteObjectParam) {
		const { key, bucketName } = options
		await this.minioClient.removeObject(bucketName || this.bucketName, key)
	}

	async deleteObjects(options: DeleteObjectsParam) {
		const { keys, bucketName } = options
		const filteredKeys = keys.filter((key) => key)
		if (!filteredKeys.length) return

		await this.minioClient.removeObjects(
			bucketName || this.bucketName,
			filteredKeys,
		)
	}
}
