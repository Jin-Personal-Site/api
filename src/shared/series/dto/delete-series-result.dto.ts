import { SeriesEntity } from '@/entity'
import { Type } from 'class-transformer'

export class DeleteSeriesResultDTO {
	@Type(() => SeriesEntity)
	deletedSeries: SeriesEntity
}
