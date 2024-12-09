import { PrismaService } from '@/common'
import { Injectable } from '@nestjs/common'
import { Prisma, Series } from '@prisma/client'

@Injectable()
export class SeriesService {
	constructor(private readonly prisma: PrismaService) {}

	async createSeries(dto: Prisma.SeriesCreateInput): Promise<Series> {
		return await this.prisma.series.create({
			data: {
				name: dto.name,
				slug: dto.slug,
				description: dto.description,
				thumbnail: dto.thumbnail,
			},
		})
	}

	async getAllSeries(): Promise<Series[]> {
		return await this.prisma.series.findMany({})
	}

	async deleteSeries(seriesId: number): Promise<Series> {
		return await this.prisma.series.delete({
			where: {
				id: seriesId,
			},
		})
	}

	async updateSeries(
		seriesId: number,
		data: Prisma.SeriesUncheckedUpdateInput,
	): Promise<Series> {
		return await this.prisma.series.update({
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
	}
}
