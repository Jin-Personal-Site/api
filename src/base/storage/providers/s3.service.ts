import { AppConfigService } from '@/config'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
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
export class S3Service extends BaseStorage implements IStorage, OnModuleInit {
	public s3Client: S3Client
	public bucketName: string

	constructor(private readonly configService: AppConfigService) {
		super()

		const { region, accessKey, secretKey } = this.configService.getAwsConfig()
		this.s3Client = new S3Client({
			region,
			credentials: {
				accessKeyId: accessKey,
				secretAccessKey: secretKey,
			},
		})
		this.bucketName = this.configService.getStorageBucketName()
	}

	onModuleInit() {
		Logger.log('S3 storage connected', 'S3Client')
	}

	async getObject(options: GetObjectParam) {
		const { key, bucketName } = options
		const output = await this.s3Client.send(
			new GetObjectCommand({
				Bucket: bucketName || this.bucketName,
				Key: key,
			}),
		)

		return output.Body.transformToByteArray()
	}

	async putObject(options: PutObjectParam): Promise<PutObjectResult> {
		const { bucketName, file, prefix = '' } = options
		const fileKey = options.useOriginalName
			? prefix + file.originalname
			: prefix + this.uniqueFileName(file)

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: bucketName || this.bucketName,
				Key: fileKey,
				Body: file.buffer,
				Metadata: {
					'Content-Type': file.mimetype,
				},
			}),
		)

		return { objectKey: fileKey }
	}

	async deleteObject(options: DeleteObjectParam) {
		const { key, bucketName } = options
		await this.s3Client.send(
			new DeleteObjectCommand({
				Bucket: bucketName || this.bucketName,
				Key: key,
			}),
		)
	}

	async deleteObjects(options: DeleteObjectsParam) {
		const { keys, bucketName } = options
		const filteredKeys = keys.filter((key) => key)
		if (!filteredKeys.length) return

		await this.s3Client.send(
			new DeleteObjectsCommand({
				Bucket: bucketName || this.bucketName,
				Delete: { Objects: filteredKeys.map((Key) => ({ Key })) },
			}),
		)
	}
}
