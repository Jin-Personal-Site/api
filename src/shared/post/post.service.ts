import { PrismaService } from '@/common'
import { BadRequestException, Injectable } from '@nestjs/common'
import { CreatePostDTO } from './dto'
import { Post, Prisma, Role } from '@prisma/client'

@Injectable()
export class PostService {
	constructor(private readonly prisma: PrismaService) {}

	async createPost(data: CreatePostDTO): Promise<Post> {
		const author = await this.prisma.adminUser.findUniqueOrThrow({
			where: {
				id: data.authorId,
			},
		})
		if (!author?.id) {
			throw new BadRequestException('Author not found')
		}

		return await this.prisma.post.create({
			data: {
				title: data.title,
				description: data.description,
				content: data.content,
				thumbnail: data.thumbnail,
				coverImage: data.coverImage,
				published: author.role === Role.ADMIN,
				publishedAt: author.role === Role.ADMIN ? new Date() : null,
				authorId: author.id,
				categoryId: data.categoryId,
				seriesId: data.seriesId,
			} as Prisma.PostUncheckedCreateInput,
			include: {
				author: true,
				category: true,
				series: true,
			},
		})
	}

	async getAllPost(): Promise<Post[]> {
		return await this.prisma.post.findMany({
			include: {
				author: true,
				category: true,
				series: true,
			},
		})
	}
}
