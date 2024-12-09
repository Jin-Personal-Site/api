import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Inject,
	Patch,
	Post,
	Query,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { PostService } from './post.service'
import { CreatePostDTO, UpdatePostDTO } from './dto'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { IStorage } from '@/base'
import { PostEntity } from '@/entity'
import { AuthenticatedGuard, ParsePositivePipe, User } from '@/common'

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
		@User() user: Express.User,
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

		const post = await this.postService.createPost(user, body)
		return new PostEntity(post)
	}

	@Get('all')
	@UseGuards(AuthenticatedGuard)
	async getAll() {
		const posts = await this.postService.getAllPost()
		return { posts: posts.map((post) => new PostEntity(post)) }
	}

	@Delete('delete')
	@UseGuards(AuthenticatedGuard)
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: 'thumbnail', maxCount: 1 },
			{ name: 'coverImage', maxCount: 1 },
		]),
	)
	async delete(
		@User() user: Express.User,
		@Query('id', ParsePositivePipe) postId: number,
	) {
		const post = await this.postService.deletePost(user, postId)
		if (!post) {
			throw new BadRequestException('Not found post of this ID')
		}
		return new PostEntity(post)
	}

	@Patch('update')
	@UseGuards(AuthenticatedGuard)
	async update(
		@User() user: Express.User,
		@UploadedFiles()
		{
			thumbnail,
			coverImage,
		}: {
			thumbnail: Express.Multer.File[]
			coverImage: Express.Multer.File[]
		},
		@Query('id', ParsePositivePipe) postId: number,
		@Body() body: UpdatePostDTO,
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

		const updatedPost = await this.postService.updatePost(user, postId, body)
		if (!updatedPost) {
			throw new BadRequestException('Not found category with this ID')
		}
		return { updatedCategory: new PostEntity(updatedPost) }
	}
}
