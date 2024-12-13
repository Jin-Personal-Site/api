import { SeriesEntity } from '@/entity'
import { Type } from 'class-transformer'

export class CreateSeriesResultDTO {
	@Type(() => SeriesEntity)
	series: SeriesEntity
}
