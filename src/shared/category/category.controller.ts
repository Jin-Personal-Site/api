import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { CreateCategoryDTO } from './dto'
import { CategoryService } from './category.service'
import { CategoryEntity } from '@/entity'
import { AuthenticatedGuard } from '@/common'

@Controller('admin/category')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Get('all')
	@UseGuards(AuthenticatedGuard)
	async getAll() {
		const categories = await this.categoryService.getAllCategories()
		return {
			categories: categories.map((category) => new CategoryEntity(category)),
		}
	}

	@Post('create')
	@UseGuards(AuthenticatedGuard)
	async create(@Body() body: CreateCategoryDTO) {
		const category = await this.categoryService.createCategory(body)
		return { category: new CategoryEntity(category) }
	}
}
