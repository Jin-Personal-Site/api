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
import {
	AllPostOutputDTO,
	CreatePostDTO,
	CreatePostResultDTO,
	DeletePostResultDTO,
	UpdatePostDTO,
	UpdatePostResultDTO,
} from './dto'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { IStorage } from '@/base'
import {
	ApiErrorResponse,
	ApiSuccessResponse,
	AuthenticatedGuard,
	ParsePositivePipe,
	User,
	ValidationErrorDetail,
} from '@/common'

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
	@ApiSuccessResponse(201, CreatePostResultDTO)
	@ApiErrorResponse(400, ValidationErrorDetail, true)
	@ApiErrorResponse(401)
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
		return new CreatePostResultDTO({ post })
	}

	@Get('all')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, AllPostOutputDTO)
	async getAll() {
		const posts = await this.postService.getAllPost()
		return new AllPostOutputDTO({ posts })
	}

	@Delete('delete')
	@UseGuards(AuthenticatedGuard)
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: 'thumbnail', maxCount: 1 },
			{ name: 'coverImage', maxCount: 1 },
		]),
	)
	@ApiSuccessResponse(200, DeletePostResultDTO)
	@ApiErrorResponse(400)
	async delete(
		@User() user: Express.User,
		@Query('id', ParsePositivePipe) postId: number,
	) {
		const deletedPost = await this.postService.deletePost(user, postId)
		if (!deletedPost) {
			throw new BadRequestException('Not found post of this ID')
		}
		return new DeletePostResultDTO({ deletedPost })
	}

	@Patch('update')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, UpdatePostResultDTO)
	@ApiErrorResponse(400)
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
		return new UpdatePostResultDTO({ updatedPost })
	}
}
