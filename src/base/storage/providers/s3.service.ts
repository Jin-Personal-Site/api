import { AppConfigService } from '@/config'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import {
	BaseStorage,
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

		this.s3Client = new S3Client({
			region: process.env.AWS_REGION,
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			},
		})
		this.bucketName = process.env.AWS_PUBLIC_BUCKET_NAME
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
}
