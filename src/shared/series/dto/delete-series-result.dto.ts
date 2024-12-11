import { BaseEntity, SeriesEntity } from '@/entity'
import { Series } from '@prisma/client'
import { Transform } from 'class-transformer'

type DeleteSeriesResult = {
	deletedSeries: SeriesEntity
}

export class DeleteSeriesResultDTO
	extends BaseEntity<DeleteSeriesResult>
	implements DeleteSeriesResult
{
	@Transform(({ value }) => new SeriesEntity(value as Series))
	deletedSeries: SeriesEntity
}
