import { BaseEntity, SeriesEntity } from '@/entity'
import { Series } from '@prisma/client'
import { Transform } from 'class-transformer'

type CreateSeriesResult = {
	series: SeriesEntity
}

export class CreateSeriesResultDTO
	extends BaseEntity<CreateSeriesResult>
	implements CreateSeriesResult
{
	@Transform(({ value }) => new SeriesEntity(value as Series))
	series: SeriesEntity
}
