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
		return new CreateCategoryResultDTO({ category })
	}

	@Get('all')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, AllCategoriesOutputDTO, true)
	@ApiErrorResponse(403)
	async getAll() {
		const categories = await this.categoryService.getAllCategories()
		return new AllCategoriesOutputDTO({ categories })
	}

	@Delete('delete')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, DeleteCategoryResultDTO)
	@ApiErrorResponse(400)
	@ApiErrorResponse(403)
	async delete(@Query('id', ParsePositivePipe) categoryId: number) {
		const deletedCategory =
			await this.categoryService.deleteCategory(categoryId)
		if (!deletedCategory) {
			throw new BadRequestException('Not found category with this ID')
		}
		return new DeleteCategoryResultDTO({ deletedCategory })
	}

	@Patch('update')
	@UseGuards(AuthenticatedGuard)
	@ApiSuccessResponse(200, UpdateCategoryResultDTO)
	@ApiErrorResponse(400)
	@ApiErrorResponse(403)
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
		return new UpdateCategoryResultDTO({ updatedCategory })
	}
}
