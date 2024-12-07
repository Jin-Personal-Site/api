import { Controller, Inject } from '@nestjs/common'
import { IStorage } from './providers'

@Controller('storage')
export class StorageController {
	constructor(@Inject('STORAGE') private readonly storageService: IStorage) {}
}
