import { BaseEntity, SeriesEntity } from '@/entity'
import { Series } from '@prisma/client'
import { Transform } from 'class-transformer'

type UpdateSeriesResult = {
	updatedSeries: SeriesEntity
}

export class UpdateSeriesResultDTO
	extends BaseEntity<UpdateSeriesResult>
	implements UpdateSeriesResult
{
	@Transform(({ value }) => new SeriesEntity(value as Series))
	updatedSeries: SeriesEntity
}
