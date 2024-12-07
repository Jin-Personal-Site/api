import { Injectable } from '@nestjs/common'
import * as sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

export type GetObjectParam = {
	bucketName?: string
	key: string
}

export type PutObjectParam = {
	bucketName?: string
	file: Express.Multer.File
	prefix?: string
	useOriginalName?: boolean
}

export type PutObjectResult = {
	objectKey: string
}

export interface IStorage {
	getObject(options: GetObjectParam)
	putObject(options: PutObjectParam): PutObjectResult | Promise<PutObjectResult>
}

@Injectable()
export abstract class BaseStorage {
	uniqueFileName(file: Express.Multer.File) {
		const fileExtension = file.mimetype.split('/')[1]
		return `${uuidv4()}.${fileExtension}`
	}

	async convertImageTo(
		format: 'avif' | 'webp',
		file: Express.Multer.File,
	): Promise<{
		buffer: Buffer | null
		size: number
		contentType: string
		extension: string
	}> {
		if (file.mimetype.includes(format)) {
			console.log(
				`Ignored converting to ${format.toUpperCase()} because it has already been`,
			)
			return null
		}
		if (!file.mimetype.includes('image')) {
			console.log(
				`Ignored converting to ${format.toUpperCase()} because it is not an image`,
			)
			return null
		}

		const buffer = await sharp(file.buffer)
			[format]({
				lossless: true,
			})
			.toBuffer()

		return {
			buffer,
			size: buffer ? Buffer.byteLength(buffer) : Infinity,
			contentType: `image/${format.toLowerCase()}`,
			extension: format.toLowerCase(),
		}
	}
}
