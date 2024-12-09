import { PrismaService } from '@/common'
import { Injectable } from '@nestjs/common'
import { Category, Prisma } from '@prisma/client'

@Injectable()
export class CategoryService {
	constructor(private readonly prisma: PrismaService) {}

	async createCategory(dto: Prisma.CategoryCreateInput): Promise<Category> {
		return await this.prisma.category.create({
			data: {
				name: dto.name,
				slug: dto.slug,
				color: dto.color,
			},
		})
	}

	async getAllCategories(): Promise<Category[]> {
		return await this.prisma.category.findMany({})
	}

	async deleteCategory(categoryId: number): Promise<Category> {
		return await this.prisma.category.delete({
			where: {
				id: categoryId,
			},
		})
	}

	async updateCategory(
		categoryId: number,
		data: Prisma.CategoryUpdateInput,
	): Promise<Category> {
		return await this.prisma.category.update({
			where: {
				id: categoryId,
			},
			data: {
				name: data.name,
				slug: data.slug,
				color: data.color,
			},
		})
	}
}
