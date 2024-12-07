import { PrismaService } from '@/common'
import { Injectable } from '@nestjs/common'
import { CreateCategoryDTO } from './dto'
import { Category } from '@prisma/client'

@Injectable()
export class CategoryService {
	constructor(private readonly prisma: PrismaService) {}

	async createCategory(dto: CreateCategoryDTO): Promise<Category> {
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
}
