import { SeriesEntity } from '@/entity'
import { Type } from 'class-transformer'

export class AllSeriesOutputDTO {
	@Type(() => SeriesEntity)
	series: SeriesEntity[]
}
