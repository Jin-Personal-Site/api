import { BaseEntity, SeriesEntity } from '@/entity'
import { Series } from '@prisma/client'
import { Transform } from 'class-transformer'

type AllSeriesOutput = {
	series: SeriesEntity[]
}

export class AllSeriesOutputDTO
	extends BaseEntity<AllSeriesOutput>
	implements AllSeriesOutput
{
	@Transform(({ value }) =>
		(value as Series[]).map((item) => new SeriesEntity(item)),
	)
	series: SeriesEntity[]
}
