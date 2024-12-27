import { getCacheKey } from '@/base'
import { CacheService, PrismaService } from '@/common'
import { BadRequestException, Injectable } from '@nestjs/common'
import { Category, Prisma } from '@prisma/client'

@Injectable()
export class CategoryService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cacheService: CacheService,
	) {}

	async createCategory(dto: Prisma.CategoryCreateInput): Promise<Category> {
		const createdCategory = await this.prisma.category.create({
			data: {
				name: dto.name,
				slug: dto.slug,
				color: dto.color,
			},
		})
		await this.cacheService.del(getCacheKey.category.all)

		return createdCategory
	}

	async getAllCategories(): Promise<Category[]> {
		return await this.cacheService.getSet(getCacheKey.category.all, () =>
			this.prisma.category.findMany({}),
		)
	}

	async deleteCategory(categoryId: number): Promise<Category> {
		const [postCount, categoryDetail] = await Promise.all([
			this.cacheService.getSet(getCacheKey.category.countPost(categoryId), () =>
				this.prisma.post.count({
					where: {
						categoryId,
					},
				}),
			),
			this.cacheService.getSet(getCacheKey.category.detail(categoryId), () =>
				this.prisma.category.findUnique({ where: { id: categoryId } }),
			),
		])
		if (!categoryDetail) {
			throw new BadRequestException('Category not found')
		}
		if (postCount) {
			throw new BadRequestException('Cannot delete category having posts')
		}
		const deletedCategory = await this.prisma.category.delete({
			where: {
				id: categoryId,
			},
		})
		await this.cacheService.del(getCacheKey.category.all)

		return deletedCategory
	}

	async updateCategory(
		categoryId: number,
		data: Prisma.CategoryUpdateInput,
	): Promise<Category> {
		const category = await this.cacheService.getSet(
			getCacheKey.category.detail(categoryId),
			() => this.prisma.category.findUnique({ where: { id: categoryId } }),
		)
		if (!category) {
			throw new BadRequestException('Not found category with this ID')
		}
		const updatedCategory = await this.prisma.category.update({
			where: {
				id: categoryId,
			},
			data: {
				name: data.name,
				slug: data.slug,
				color: data.color,
			},
		})
		await this.cacheService.del(getCacheKey.category.all)

		return updatedCategory
	}
}
