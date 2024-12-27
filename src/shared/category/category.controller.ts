import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import {
	AllCategoriesOutputDTO,
	CreateCategoryDTO,
	CreateCategoryResultDTO,
	DeleteCategoryResultDTO,
	UpdateCategoryDTO,
	UpdateCategoryResultDTO,
} from './dto'
import { CategoryService } from './category.service'
import {
	ApiErrorResponse,
	ApiSuccessResponse,
	AuthenticatedGuard,
	ParsePositivePipe,
	ValidationErrorDetail,
} from '@/common'
import { plainToInstance } from 'class-transformer'

@Controller('admin/category')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Post('create')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(201, CreateCategoryResultDTO)
	@ApiErrorResponse(400, ValidationErrorDetail, true)
	@ApiErrorResponse(403)
	async create(@Body() body: CreateCategoryDTO) {
		const category = await this.categoryService.createCategory(body)
		return plainToInstance(CreateCategoryResultDTO, { category })
	}

	@Get('all')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, AllCategoriesOutputDTO, true)
	@ApiErrorResponse(403)
	async getAll() {
		const categories = await this.categoryService.getAllCategories()
		return plainToInstance(AllCategoriesOutputDTO, { categories })
	}

	@Delete(':id/delete')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, DeleteCategoryResultDTO)
	@ApiErrorResponse(400)
	@ApiErrorResponse(403)
	async delete(@Param('id', ParsePositivePipe) categoryId: number) {
		const deletedCategory =
			await this.categoryService.deleteCategory(categoryId)
		return plainToInstance(DeleteCategoryResultDTO, { deletedCategory })
	}

	@Patch(':id/update')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, UpdateCategoryResultDTO)
	@ApiErrorResponse(400)
	@ApiErrorResponse(403)
	async update(
		@Param('id', ParsePositivePipe) categoryId: number,
		@Body() body: UpdateCategoryDTO,
	) {
		const updatedCategory = await this.categoryService.updateCategory(
			categoryId,
			body,
		)
		return plainToInstance(UpdateCategoryResultDTO, { updatedCategory })
	}
}
