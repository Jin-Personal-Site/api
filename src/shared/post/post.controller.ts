import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Inject,
	Param,
	Patch,
	Post,
	Query,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import { PostService } from './post.service'
import {
	AllPostDTO,
	AllPostOutputDTO,
	CreatePostDTO,
	CreatePostResultDTO,
	DeletePostResultDTO,
	PostDetailOutputDTO,
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
import { plainToInstance } from 'class-transformer'

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
		images: {
			thumbnail: Express.Multer.File[]
			coverImage: Express.Multer.File[]
		},
	) {
		const [thumbnailResult, coverResult] = await Promise.all([
			images?.thumbnail?.[0] &&
				this.storageService.putObject({
					file: images?.thumbnail[0],
					prefix: 'images/post/thumbnails/',
				}),
			images?.coverImage?.[0] &&
				this.storageService.putObject({
					file: images?.coverImage[0],
					prefix: 'images/post/covers/',
				}),
		])

		body.thumbnail = thumbnailResult?.objectKey
		body.coverImage = coverResult?.objectKey

		try {
			const post = await this.postService.createPost(user, body)
			return plainToInstance(CreatePostResultDTO, { post })
		} catch (exception) {
			await this.storageService.deleteObjects({
				keys: [body.thumbnail, body.coverImage],
			})
			throw exception
		}
	}

	@Get('all')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, AllPostOutputDTO)
	async getAll(@Query() query: AllPostDTO) {
		const postData = await this.postService.getAllPost(query)
		return plainToInstance(AllPostOutputDTO, postData)
	}

	@Get(':id')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, PostDetailOutputDTO)
	@ApiErrorResponse(400)
	async getPostDetail(@Param('id', ParsePositivePipe) postId: number) {
		const postData = await this.postService.getPostById(postId)
		return plainToInstance(PostDetailOutputDTO, { post: postData })
	}

	@Delete(':id/delete')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, DeletePostResultDTO)
	@ApiErrorResponse(400)
	async delete(
		@User() user: Express.User,
		@Param('id', ParsePositivePipe) postId: number,
	) {
		const deletedPost = await this.postService.deletePost(user, postId)
		if (!deletedPost) {
			throw new BadRequestException('Not found post of this ID')
		}
		return plainToInstance(DeletePostResultDTO, { deletedPost })
	}

	@Patch(':id/update')
	@UseGuards(AuthenticatedGuard)
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: 'thumbnail', maxCount: 1 },
			{ name: 'coverImage', maxCount: 1 },
		]),
	)
	@ApiSuccessResponse(200, UpdatePostResultDTO)
	@ApiErrorResponse(400)
	async update(
		@User() user: Express.User,
		@Param('id', ParsePositivePipe) postId: number,
		@Body() body: UpdatePostDTO,
		@UploadedFiles()
		images: {
			thumbnail: Express.Multer.File[]
			coverImage: Express.Multer.File[]
		},
	) {
		const [thumbnailResult, coverResult] = await Promise.all([
			images?.thumbnail?.[0] &&
				this.storageService.putObject({
					file: images?.thumbnail[0],
					prefix: 'images/thumbnails/',
				}),
			images?.coverImage?.[0] &&
				this.storageService.putObject({
					file: images?.coverImage[0],
					prefix: 'images/covers/',
				}),
		])

		body.thumbnail = thumbnailResult?.objectKey
		body.coverImage = coverResult?.objectKey

		try {
			const updatedPost = await this.postService.updatePost(user, postId, body)
			return plainToInstance(UpdatePostResultDTO, { updatedPost })
		} catch (exception) {
			await this.storageService.deleteObjects({
				keys: [body.thumbnail, body.coverImage],
			})
			throw exception
		}
	}
}
