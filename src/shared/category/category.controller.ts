import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import { CreateCategoryDTO, UpdateCategoryDTO } from './dto'
import { CategoryService } from './category.service'
import { CategoryEntity } from '@/entity'
import { AuthenticatedGuard, ParsePositivePipe } from '@/common'

@Controller('admin/category')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Post('create')
	@UseGuards(AuthenticatedGuard)
	async create(@Body() body: CreateCategoryDTO) {
		const category = await this.categoryService.createCategory(body)
		return { category: new CategoryEntity(category) }
	}

	@Get('all')
	@UseGuards(AuthenticatedGuard)
	async getAll() {
		const categories = await this.categoryService.getAllCategories()
		return {
			categories: categories.map((category) => new CategoryEntity(category)),
		}
	}

	@Delete('delete')
	@UseGuards(AuthenticatedGuard)
	async delete(@Query('id', ParsePositivePipe) categoryId: number) {
		const deletedCategory =
			await this.categoryService.deleteCategory(categoryId)
		if (!deletedCategory) {
			throw new BadRequestException('Not found category with this ID')
		}
		return { deletedCategory: new CategoryEntity(deletedCategory) }
	}

	@Patch('update')
	@UseGuards(AuthenticatedGuard)
	async update(
		@Query('id', ParsePositivePipe) categoryId: number,
		@Body() body: UpdateCategoryDTO,
	) {
		const updatedCategory = await this.categoryService.updateCategory(
			categoryId,
			body,
		)
		if (!updatedCategory) {
			throw new BadRequestException('Not found category with this ID')
		}
		return { updatedCategory: new CategoryEntity(updatedCategory) }
	}
}
