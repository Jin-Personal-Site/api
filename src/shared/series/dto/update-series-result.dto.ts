import { SeriesEntity } from '@/entity'
import { Type } from 'class-transformer'

export class UpdateSeriesResultDTO {
	@Type(() => SeriesEntity)
	updatedSeries: SeriesEntity
}
