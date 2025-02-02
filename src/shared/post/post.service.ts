import {
	CacheService,
	counter,
	getSlug,
	Pagination,
	PrismaService,
} from '@/common'
import { BadRequestException, Injectable } from '@nestjs/common'
import {
	AllPostDTO,
	AllPostOutputDTO,
	CreatePostDTO,
	UpdatePostDTO,
} from './dto'
import { Category, Post, Prisma, Role, Series } from '@prisma/client'
import { AdminUserEntity } from '@/entity'
import { getCacheKey } from '@/base'
import { plainToInstance } from 'class-transformer'

@Injectable()
export class PostService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cacheService: CacheService,
	) {}

	private async getTotalPost(): Promise<number> {
		return await this.cacheService.getSet(getCacheKey.post.total, () =>
			this.prisma.post.count(),
		)
	}

	private async allSlugs(): Promise<string[]> {
		const posts = await this.cacheService.getSet(
			getCacheKey.post.allSlugs,
			() =>
				this.prisma.post.findMany({
					select: {
						slug: true,
					},
				}),
		)
		return posts.map((post) => post.slug)
	}

	async createPost(
		author: AdminUserEntity,
		data: CreatePostDTO,
	): Promise<Post> {
		let category: Category = null
		let series: Series = null

		if (data.categoryId) {
			category = await this.prisma.category.findUnique({
				where: {
					id: data.categoryId,
				},
			})
			if (!category) {
				throw new BadRequestException('Category does not exist')
			}
		}

		if (data.seriesId) {
			series = await this.prisma.series.findUnique({
				where: {
					id: data.seriesId,
				},
			})
			if (!series) {
				throw new BadRequestException('Series does not exist')
			}
		}

		const slug = getSlug(await this.allSlugs(), data.title)
		const createdPost = await this.prisma.post.create({
			data: {
				title: data.title,
				slug,
				description: data.description,
				content: data.content,
				thumbnail: data.thumbnail,
				coverImage: data.coverImage,
				published: author.role === Role.ADMIN,
				approved: author.role === Role.ADMIN,
				publishedAt: author.role === Role.ADMIN ? new Date() : null,
				authorId: author.id,
				categoryId: category?.id,
				seriesId: series?.id,
			} as Prisma.PostUncheckedCreateInput,
			include: {
				author: true,
				category: true,
				series: true,
			},
		})

		this.cacheService.delByPrefix('post')

		return createdPost
	}

	async getAllPost(query: AllPostDTO): Promise<AllPostOutputDTO> {
		const totalCount = await this.getTotalPost()
		const pagination = plainToInstance(Pagination, {
			page: query.page,
			limit: query.limit,
			totalCount,
		} as Pagination)
		const postsCacheKey = getCacheKey.post.all(
			pagination.page,
			pagination.limit,
		)
		const posts = await this.cacheService.getSet(postsCacheKey, () =>
			this.prisma.post.findMany({
				include: {
					author: true,
					category: true,
					series: true,
				},
				orderBy: { createdAt: 'desc' },
				skip: (pagination.page - 1) * pagination.limit,
				take: pagination.limit,
			}),
		)

		return { posts, pagination }
	}

	async getPostById(postId: number): Promise<Post> {
		const post = await this.cacheService.getSet(
			getCacheKey.post.detail(postId),
			() =>
				this.prisma.post.findUnique({
					where: {
						id: postId,
					},
					include: {
						author: true,
						category: true,
						series: true,
					},
				}),
		)
		if (!post) {
			throw new BadRequestException('Post not found')
		}

		return post
	}

	async deletePost(user: AdminUserEntity, id: number) {
		const post = await this.prisma.post.findFirst({ where: { id } })
		if (!post) {
			throw new BadRequestException('Post not found')
		}
		if (user.role === Role.EDITOR && post.authorId !== user.id) {
			throw new BadRequestException('Only post owner or admin')
		}
		const deletedPost = await this.prisma.post.delete({
			where: {
				id,
			},
			include: {
				author: true,
			},
		})
		await this.cacheService.delByPrefix('post')

		return deletedPost
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
			throw new BadRequestException('Only post owner or admin')
		}

		const updatedPost = await this.prisma.post.update({
			where: { id: postId },
			data: {
				...data,
				publishedAt:
					!post.published && data.published ? new Date() : post.publishedAt,
			},
			include: {
				author: true,
				category: true,
				series: true,
			},
		})

		if (!updatedPost) {
			throw new BadRequestException('Not found post with this ID')
		}
		await this.cacheService.delByPrefix('post')

		return updatedPost
	}
}
