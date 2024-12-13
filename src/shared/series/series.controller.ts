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
import {
	ApiErrorResponse,
	ApiSuccessResponse,
	AuthenticatedGuard,
	ParsePositivePipe,
	ValidationErrorDetail,
} from '@/common'
import { SeriesService } from './series.service'
import {
	AllSeriesOutputDTO,
	CreateSeriesDTO,
	CreateSeriesResultDTO,
	DeleteSeriesResultDTO,
	UpdateSeriesDTO,
	UpdateSeriesResultDTO,
} from './dto'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { IStorage } from '@/base'
import { plainToInstance } from 'class-transformer'

@Controller('admin/series')
export class SeriesController {
	constructor(
		@Inject('STORAGE') private readonly storageService: IStorage,
		private readonly seriesService: SeriesService,
	) {}

	@Post('create')
	@UseGuards(AuthenticatedGuard)
	@UseInterceptors(FileFieldsInterceptor([{ name: 'thumbnail', maxCount: 1 }]))
	@ApiSuccessResponse(201, CreateSeriesResultDTO)
	@ApiErrorResponse(400, ValidationErrorDetail, true)
	@ApiErrorResponse(403)
	async create(
		@Body() body: CreateSeriesDTO,
		@UploadedFiles() files: { thumbnail: Express.Multer.File[] },
	) {
		const thumbnailResult =
			files.thumbnail?.[0] &&
			(await this.storageService.putObject({
				file: files.thumbnail[0],
				prefix: 'images/thumbnails/',
			}))

		body.thumbnail = thumbnailResult?.objectKey

		const series = await this.seriesService.createSeries(body)
		return plainToInstance(CreateSeriesResultDTO, { series })
	}

	@Get('all')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, AllSeriesOutputDTO)
	@ApiErrorResponse(403)
	async getAll() {
		const series = await this.seriesService.getAllSeries()
		return plainToInstance(AllSeriesOutputDTO, { series })
	}

	@Delete('delete')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(201, AllSeriesOutputDTO)
	@ApiErrorResponse(403)
	async delete(@Query('id', ParsePositivePipe) seriesId: number) {
		const deletedSeries = await this.seriesService.deleteSeries(seriesId)
		if (!deletedSeries) {
			throw new BadRequestException('Not found category with this ID')
		}
		return plainToInstance(DeleteSeriesResultDTO, { deletedSeries })
	}

	@Patch('update')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(201, UpdateSeriesResultDTO)
	@ApiErrorResponse(403)
	async update(
		@Query('id', ParsePositivePipe) seriesId: number,
		@Body() body: UpdateSeriesDTO,
	): Promise<UpdateSeriesResultDTO> {
		const updatedSeries = await this.seriesService.updateSeries(seriesId, body)
		if (!updatedSeries) {
			throw new BadRequestException('Not found category with this ID')
		}
		return plainToInstance(UpdateSeriesResultDTO, { updatedSeries })
	}
}
