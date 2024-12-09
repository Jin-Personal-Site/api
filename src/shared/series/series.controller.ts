import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import { SeriesEntity } from '@/entity'
import { AuthenticatedGuard, ParsePositivePipe } from '@/common'
import { SeriesService } from './series.service'
import { CreateSeriesDTO, UpdateSeriesDTO } from './dto'

@Controller('admin/series')
export class SeriesController {
	constructor(private readonly seriesService: SeriesService) {}

	@Post('create')
	@UseGuards(AuthenticatedGuard)
	async create(@Body() body: CreateSeriesDTO) {
		const series = await this.seriesService.createSeries(body)
		return { series: new SeriesEntity(series) }
	}

	@Get('all')
	@UseGuards(AuthenticatedGuard)
	async getAll() {
		const series = await this.seriesService.getAllSeries()
		return {
			series: series.map((item) => new SeriesEntity(item)),
		}
	}

	@Delete('delete')
	@UseGuards(AuthenticatedGuard)
	async delete(@Query('id', ParsePositivePipe) seriesId: number) {
		const deletedSeries = await this.seriesService.deleteSeries(seriesId)
		if (!deletedSeries) {
			throw new BadRequestException('Not found category with this ID')
		}
		return { deletedSeries: new SeriesEntity(deletedSeries) }
	}

	@Patch('update')
	@UseGuards(AuthenticatedGuard)
	async update(
		@Query('id', ParsePositivePipe) seriesId: number,
		@Body() body: UpdateSeriesDTO,
	) {
		const updatedSeries = await this.seriesService.updateSeries(seriesId, body)
		if (!updatedSeries) {
			throw new BadRequestException('Not found category with this ID')
		}
		return { updatedSeries: new SeriesEntity(updatedSeries) }
	}
}
