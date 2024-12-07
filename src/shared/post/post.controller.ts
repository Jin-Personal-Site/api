import {
	Body,
	Controller,
	Get,
	Inject,
	Post,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { PostService } from './post.service'
import { CreatePostDTO } from './dto'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { IStorage } from '@/base'
import { PostEntity } from '@/entity'
import { AuthenticatedGuard } from '@/common'

@Controller('admin/post')
export class PostController {
	constructor(
		private readonly postService: PostService,
		@Inject('STORAGE') private readonly storageService: IStorage,
	) {}

	@Post('create')
	@UseGuards(AuthenticatedGuard)
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: 'thumbnail', maxCount: 1 },
			{ name: 'coverImage', maxCount: 1 },
		]),
	)
	async create(
		@Body() body: CreatePostDTO,
		@UploadedFiles()
		{
			thumbnail,
			coverImage,
		}: {
			thumbnail: Express.Multer.File[]
			coverImage: Express.Multer.File[]
		},
	) {
		const [thumbnailResult, coverResult] = await Promise.all([
			thumbnail?.[0] &&
				this.storageService.putObject({
					file: thumbnail[0],
					prefix: 'images/thumbnails/',
				}),
			coverImage?.[0] &&
				this.storageService.putObject({
					file: coverImage[0],
					prefix: 'images/covers/',
				}),
		])

		body.thumbnail = thumbnailResult?.objectKey
		body.coverImage = coverResult?.objectKey

		const post = await this.postService.createPost(body)
		return new PostEntity(post)
	}

	@Get('all')
	@UseGuards(AuthenticatedGuard)
	async getAll() {
		const posts = await this.postService.getAllPost()
		return { posts: posts.map((post) => new PostEntity(post)) }
	}
}
