import { PrismaService } from '@/common'
import { BadRequestException, Injectable } from '@nestjs/common'
import { CreatePostDTO, UpdatePostDTO } from './dto'
import { Post, Prisma, Role } from '@prisma/client'
import { AdminUserEntity } from '@/entity'

@Injectable()
export class PostService {
	constructor(private readonly prisma: PrismaService) {}

	async createPost(
		author: AdminUserEntity,
		data: CreatePostDTO,
	): Promise<Post> {
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

	async deletePost(user: AdminUserEntity, id: number) {
		const post = await this.prisma.post.findFirst({ where: { id } })
		if (!post) {
			throw new BadRequestException('Post not found')
		}
		if (user.role === Role.EDITOR && post.authorId !== user.id) {
			return await this.prisma.post.delete({
				where: {
					id,
				},
			})
		}
		throw new BadRequestException('Only post owner or admin')
	}

	async updatePost(
		user: AdminUserEntity,
		postId: number,
		data: UpdatePostDTO,
	): Promise<Post> {
		const post = await this.prisma.post.findFirst({ where: { id: postId } })
		if (!post) {
			throw new BadRequestException('Post not found')
		}
		if (user.role === Role.EDITOR && post.authorId !== user.id) {
			return await this.prisma.post.create({
				data: {
					title: data.title,
					description: data.description,
					content: data.content,
					thumbnail: data.thumbnail,
					coverImage: data.coverImage,
					approved: data.approved,
					published: data.published,
					publishedAt: !post.published && data.published ? new Date() : null,
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
		throw new BadRequestException('Only post owner or admin')
	}
}
