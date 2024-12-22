import * as request from 'supertest'
import { App } from 'supertest/types'

import { AppModule } from '@/app.module'
import { middlewares } from '@/app.middleware'
import {
	ErrorDetail,
	ErrorResponse,
	getErrorCode,
	SuccessResponse,
} from '@/common'
import { PostEntity } from '@/entity'
import {
	AllPostDTO,
	AllPostOutputDTO,
	CreatePostDTO,
	CreatePostResultDTO,
} from '@/shared'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { omit } from 'lodash'

const getLoginSession = async (app: App, username, password) => {
	const loginRes = await request(app)
		.post('/admin/login')
		.send({ username, password })
		.expect(201)
		.expect('Set-Cookie', /^connect\.sid=/)
	return loginRes.headers['set-cookie'][0]
}

describe('PostController (e2e)', () => {
	let app: INestApplication
	const username = 'admin'
	const password = 'admin'

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()

		middlewares(app)
		await app.init()
	})

	describe('POST /admin/post/create', () => {
		describe('happy cases', () => {
			test.each<{
				ignore: (keyof CreatePostDTO)[]
				images: ('thumbnail' | 'coverImage')[]
			}>([
				{
					ignore: ['categoryId', 'seriesId'],
					images: ['coverImage', 'thumbnail'],
				},
				{ ignore: ['categoryId'], images: ['coverImage'] },
				{ ignore: ['seriesId'], images: ['thumbnail'] },
				{ ignore: [], images: [] },
			])(
				'create with no $ignore and image $images',
				async ({ ignore, images }) => {
					const sessionCookie = await getLoginSession(
						app.getHttpServer(),
						username,
						password,
					)
					const createData: CreatePostDTO = {
						title: faker.lorem.sentence({ min: 8, max: 12 }),
						description: faker.lorem.sentences({ min: 2, max: 3 }),
						content: faker.lorem.paragraphs({ min: 2, max: 5 }),
						published: true,
						categoryId: 1,
						seriesId: 1,
					}
					const imageMock = {
						fieldname: 'thumbnail',
						originalname: 'thumbnail.jpg',
						buffer: Buffer.from(faker.lorem.words()),
						mimetype: 'image/jpeg',
					} as Express.Multer.File

					const payload: Partial<CreatePostDTO> = omit(createData, ignore)

					let req = request(app.getHttpServer())
						.post('/admin/post/create')
						.set('Cookie', sessionCookie)
						.field({
							...payload,
						})

					if (images.includes('thumbnail')) {
						req = req.attach('thumbnail', imageMock.buffer, {
							filename: imageMock.originalname,
							contentType: imageMock.mimetype,
						})
					}
					if (images.includes('coverImage')) {
						req = req.attach('coverImage', imageMock.buffer, {
							filename: imageMock.originalname,
							contentType: imageMock.mimetype,
						})
					}

					return await req
						.expect(201)
						.expect('Content-Type', /json/)
						.expect(({ body }) => {
							expect(body).toEqual(
								expect.objectContaining<SuccessResponse<CreatePostResultDTO>>({
									success: true,
									data: {
										post: expect.objectContaining<Partial<PostEntity>>({
											id: expect.any(Number),
											title: payload.title,
											description: payload.description,
											content: payload.content,
											thumbnail: images.includes('thumbnail')
												? expect.any(String)
												: expect.toBeNil(),
											coverImage: images.includes('coverImage')
												? expect.any(String)
												: expect.toBeNil(),
											updatedAt: expect.any(String),
											publishedAt: expect.any(String),
											author: expect.objectContaining({
												id: expect.any(Number),
												name: expect.any(String),
												username,
											}),
											category: !ignore.includes('categoryId')
												? expect.objectContaining({
														id: expect.any(Number),
														name: expect.any(String),
														slug: expect.any(String),
													})
												: expect.toBeNil(),
											series: !ignore.includes('seriesId')
												? expect.objectContaining({
														id: expect.any(Number),
														name: expect.any(String),
														slug: expect.any(String),
														description: expect.any(String),
													})
												: expect.toBeNil(),
										}),
									},
								}),
							)
						})
				},
			)
		})

		describe('bad cases', () => {
			it('no login', async () => {
				const imageMock = {
					fieldname: 'thumbnail',
					originalname: 'thumbnail.jpg',
					buffer: Buffer.from('mock thumbnail image data'),
					mimetype: 'image/jpeg',
				} as Express.Multer.File

				const payload: CreatePostDTO = {
					title: 'This is title',
					description: 'This is description',
					content: 'This is a long content',
					published: true,
				}

				return await request(app.getHttpServer())
					.post('/admin/post/create')
					.attach('thumbnail', imageMock.buffer, {
						filename: imageMock.originalname,
						contentType: imageMock.mimetype,
					})
					.field({
						...payload,
					})
					.expect(403)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body).toEqual(
							expect.objectContaining<ErrorResponse>({
								success: false,
								error: expect.any(Object),
							}),
						)
					})
			})

			it('lack of data', async () => {
				const sessionCookie = await getLoginSession(
					app.getHttpServer(),
					username,
					password,
				)

				return await request(app.getHttpServer())
					.post('/admin/post/create')
					.set('Cookie', sessionCookie)
					.expect(400)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body).toEqual(
							expect.objectContaining<ErrorResponse>({
								success: false,
								error: expect.objectContaining<Partial<ErrorDetail>>({
									code: getErrorCode(400),
									message: expect.any(String),
									details: expect.any(Array),
								}),
							}),
						)
					})
			})

			test.each<{ notFound: 'category' | 'series' }>([
				{ notFound: 'category' },
				{ notFound: 'series' },
			])('not found $notFound', async ({ notFound }) => {
				const sessionCookie = await getLoginSession(
					app.getHttpServer(),
					username,
					password,
				)

				const payload: CreatePostDTO = {
					title: faker.lorem.sentence({ min: 8, max: 12 }),
					description: faker.lorem.sentences({ min: 2, max: 5 }),
					content: faker.lorem.paragraphs({ min: 2, max: 5 }),
					published: true,
				}
				if (notFound === 'category') {
					payload.categoryId = 9999999
				}
				if (notFound === 'series') {
					payload.seriesId = 9999999
				}
				return await request(app.getHttpServer())
					.post('/admin/post/create')
					.set('Cookie', sessionCookie)
					.field({
						...payload,
					})
					.expect(400)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body).toEqual(
							expect.objectContaining<ErrorResponse>({
								success: false,
								error: expect.objectContaining<Partial<ErrorDetail>>({
									code: getErrorCode(400),
									message: expect.any(String),
								}),
							}),
						)
					})
			})
		})
	})

	describe('GET /admin/post/all', () => {
		test.each([
			{ page: 1, limit: 10 },
			{ page: 2, limit: 20 },
			{ page: -1, limit: 100 },
			{ page: 3, limit: 2 },
			{ page: 100, limit: undefined },
			{ page: undefined, limit: 30 },
			{ page: undefined, limit: undefined },
		])('get all, page $page with $limit items', async ({ page, limit }) => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			const query: AllPostDTO = {
				page,
				limit,
			}

			const { body } = await request(app.getHttpServer())
				.get('/admin/post/all')
				.set('Cookie', sessionCookie)
				.query(query)
				.expect(200)
				.expect('Content-Type', /json/)

			expect(body).toEqual<SuccessResponse>(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining<AllPostOutputDTO>({
						posts: expect.any(Array),
						pagination: expect.objectContaining({
							page: expect.any(Number),
							limit: expect.any(Number),
							totalCount: expect.any(Number),
							maxPage: expect.any(Number),
						}),
					}),
				}),
			)
			const { pagination, posts } = body.data as AllPostOutputDTO
			posts.forEach((post) => {
				expect(post).toEqual<PostEntity>(
					expect.objectContaining({
						id: expect.any(Number),
						title: expect.any(String),
						description: expect.any(String),
						content: expect.any(String),
						publishedAt: expect.any(String),
						author: expect.objectContaining({
							id: expect.any(Number),
							name: expect.any(String),
							username: expect.any(String),
						}),
						category: post.category
							? expect.objectContaining({
									id: expect.any(Number),
									name: expect.any(String),
									slug: expect.any(String),
								})
							: null,
						series: post.series
							? expect.objectContaining({
									id: expect.any(Number),
									name: expect.any(String),
									slug: expect.any(String),
									description: expect.any(String),
								})
							: null,
					}),
				)
			})
			expect(pagination.maxPage).toBePositive()
			expect(pagination.page).toEqual(
				Math.min(
					pagination.maxPage,
					Math.max(query.page ?? pagination.page, 1),
				),
			)
			expect(pagination.limit).toEqual(
				Math.max(query.limit ?? pagination.limit, 5),
			)
			expect(pagination.totalCount).toBeGreaterThanOrEqual(
				pagination.limit * (pagination.maxPage - 1),
			)
			if (pagination.page >= pagination.maxPage) {
				expect(posts.length).toEqual(pagination.totalCount % pagination.limit)
			} else {
				expect(posts.length).toEqual(pagination.limit)
			}
		})

		it('posts updated after creation', async () => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			const payload: CreatePostDTO = {
				title: faker.lorem.sentence({ min: 8, max: 12 }),
				description: faker.lorem.sentences({ min: 2, max: 5 }),
				content: faker.lorem.paragraphs({ min: 2, max: 5 }),
				published: true,
				categoryId: 1,
				seriesId: 1,
			}
			const imageMock = {
				fieldname: 'thumbnail',
				originalname: 'thumbnail.jpg',
				buffer: Buffer.from(faker.lorem.words()),
				mimetype: 'image/jpeg',
			} as Express.Multer.File

			await request(app.getHttpServer())
				.get('/admin/post/all')
				.set('Cookie', sessionCookie)
				.expect(200)
				.expect('Content-Type', /json/)

			const {
				body: createBody,
			}: { body: SuccessResponse<CreatePostResultDTO> } = await request(
				app.getHttpServer(),
			)
				.post('/admin/post/create')
				.set('Cookie', sessionCookie)
				.field({
					...payload,
				})
				.attach('thumbnail', imageMock.buffer, {
					filename: imageMock.originalname,
					contentType: imageMock.mimetype,
				})
				.attach('coverImage', imageMock.buffer, {
					filename: imageMock.originalname,
					contentType: imageMock.mimetype,
				})
				.expect(201)

			const { body } = await request(app.getHttpServer())
				.get('/admin/post/all')
				.set('Cookie', sessionCookie)
				.expect(200)
				.expect('Content-Type', /json/)

			expect(body).toEqual<SuccessResponse>(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining<AllPostOutputDTO>({
						posts: expect.any(Array),
						pagination: expect.objectContaining({
							page: expect.any(Number),
							limit: expect.any(Number),
							totalCount: expect.any(Number),
							maxPage: expect.any(Number),
						}),
					}),
				}),
			)
			const { posts } = body.data as AllPostOutputDTO

			expect(posts[0]).toEqual(
				expect.objectContaining<Partial<PostEntity>>({
					id: createBody.data.post.id,
					title: payload.title,
					description: payload.description,
					content: payload.content,
					category: expect.objectContaining({
						id: payload.categoryId,
					}),
					series: expect.objectContaining({
						id: payload.seriesId,
					}),
				}),
			)
		})
	})
})
