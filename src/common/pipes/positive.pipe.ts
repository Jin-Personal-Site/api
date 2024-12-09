import {
	ArgumentMetadata,
	BadRequestException,
	Injectable,
	PipeTransform,
} from '@nestjs/common'
import { isPositive } from 'class-validator'

@Injectable()
export class ParsePositivePipe implements PipeTransform {
	transform(value: any, metadata: ArgumentMetadata) {
		if (!isPositive(value)) {
			throw new BadRequestException(`${metadata.data} must be a positive`)
		}
		return +value
	}
}
