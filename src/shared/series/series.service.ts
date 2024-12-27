import { getCacheKey } from '@/base'
import { CacheService, PrismaService } from '@/common'
import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma, Series } from '@prisma/client'

@Injectable()
export class SeriesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cacheService: CacheService,
	) {}

	async createSeries(dto: Prisma.SeriesCreateInput): Promise<Series> {
		const createdSeries = await this.prisma.series.create({
			data: {
				name: dto.name,
				slug: dto.slug,
				description: dto.description,
				thumbnail: dto.thumbnail,
			},
		})
		await this.cacheService.delByPrefix('series')

		return createdSeries
	}

	async getAllSeries(): Promise<Series[]> {
		return await this.cacheService.getSet(getCacheKey.series.all, () =>
			this.prisma.series.findMany({}),
		)
	}

	async deleteSeries(seriesId: number): Promise<Series> {
		const series = await this.cacheService.getSet(
			getCacheKey.series.detail(seriesId),
			() => this.prisma.series.findUnique({ where: { id: seriesId } }),
		)
		if (!series) {
			throw new BadRequestException('Not found series')
		}
		const deletedSeries = await this.prisma.series.delete({
			where: {
				id: seriesId,
			},
		})
		await this.cacheService.delByPrefix('series')

		return deletedSeries
	}

	async updateSeries(
		seriesId: number,
		data: Prisma.SeriesUncheckedUpdateInput,
	): Promise<Series> {
		const series = await this.cacheService.getSet(
			getCacheKey.series.detail(seriesId),
			() => this.prisma.series.findUnique({ where: { id: seriesId } }),
		)
		if (!series) {
			throw new BadRequestException('Not found series')
		}
		const updatedSeries = await this.prisma.series.update({
			where: {
				id: seriesId,
			},
			data: {
				name: data.name,
				slug: data.slug,
				description: data.description,
				thumbnail: data.thumbnail,
			},
		})
		await this.cacheService.delByPrefix('series')

		return updatedSeries
	}
}
