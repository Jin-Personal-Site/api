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
	DeletePostResultDTO,
	UpdatePostDTO,
	UpdatePostResultDTO,
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
						description: faker.lorem.sentences({ min: 1, max: 2 }),
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
						description: expect.toBeOneOf([null, expect.any(String)]),
						content: expect.any(String),
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
				description: faker.lorem.sentences({ min: 1, max: 2 }),
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

	describe('GET /admin/post/:id', () => {
		it('unauthenticated', async () => {
			return await request(app.getHttpServer())
				.get('/admin/post/1')
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

		describe('authenticated', () => {
			let sessionCookie: string

			beforeEach(async () => {
				sessionCookie = await getLoginSession(
					app.getHttpServer(),
					username,
					password,
				)
			})

			it('get existing post', async () => {
				// First create a post
				const createData: CreatePostDTO = {
					title: faker.lorem.sentence({ min: 8, max: 12 }),
					description: faker.lorem.sentences({ min: 1, max: 2 }),
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

				const {
					body: createBody,
				}: { body: SuccessResponse<CreatePostResultDTO> } = await request(
					app.getHttpServer(),
				)
					.post('/admin/post/create')
					.set('Cookie', sessionCookie)
					.field({
						...createData,
					})
					.attach('thumbnail', imageMock.buffer, {
						filename: imageMock.originalname,
						contentType: imageMock.mimetype,
					})
					.expect(201)

				// Then get the created post
				const { body } = await request(app.getHttpServer())
					.get(`/admin/post/${createBody.data.post.id}`)
					.set('Cookie', sessionCookie)
					.expect(200)
					.expect('Content-Type', /json/)

				expect(body).toEqual(
					expect.objectContaining<SuccessResponse>({
						success: true,
						data: expect.objectContaining({
							post: expect.objectContaining({
								id: createBody.data.post.id,
								title: createData.title,
								description: createData.description,
								content: createData.content,
								thumbnail: expect.any(String),
								coverImage: expect.toBeNil(),
								updatedAt: expect.any(String),
								publishedAt: expect.any(String),
								author: expect.objectContaining({
									id: expect.any(Number),
									name: expect.any(String),
									username,
								}),
								category: expect.objectContaining({
									id: createData.categoryId,
									name: expect.any(String),
									slug: expect.any(String),
								}),
								series: expect.objectContaining({
									id: createData.seriesId,
									name: expect.any(String),
									slug: expect.any(String),
									description: expect.any(String),
								}),
							}),
						}),
					}),
				)
			})

			it('get non-existent post', async () => {
				return await request(app.getHttpServer())
					.get('/admin/post/99999')
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
								}),
							}),
						)
					})
			})

			it('invalid post id format', async () => {
				return await request(app.getHttpServer())
					.get('/admin/post/invalid-id')
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
								}),
							}),
						)
					})
			})
		})
	})

	describe('DELETE /admin/post/:id/delete', () => {
		let sessionCookie: string

		beforeEach(async () => {
			sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)
		})

		describe('happy cases', () => {
			it('admin can delete any post', async () => {
				// First create a post
				const createData: CreatePostDTO = {
					title: faker.lorem.sentence({ min: 8, max: 12 }),
					description: faker.lorem.sentences({ min: 1, max: 2 }),
					content: faker.lorem.paragraphs({ min: 2, max: 5 }),
					published: true,
					categoryId: 1,
					seriesId: 1,
				}

				const {
					body: createBody,
				}: { body: SuccessResponse<CreatePostResultDTO> } = await request(
					app.getHttpServer(),
				)
					.post('/admin/post/create')
					.set('Cookie', sessionCookie)
					.field({
						...createData,
					})
					.expect(201)

				// Then delete the created post
				const { body } = await request(app.getHttpServer())
					.delete(`/admin/post/${createBody.data.post.id}/delete`)
					.set('Cookie', sessionCookie)
					.expect(200)
					.expect('Content-Type', /json/)

				expect(body).toEqual(
					expect.objectContaining<SuccessResponse<DeletePostResultDTO>>({
						success: true,
						data: {
							deletedPost: expect.objectContaining({
								id: createBody.data.post.id,
								title: createData.title,
								description: createData.description,
								content: createData.content,
							}),
						},
					}),
				)

				// Verify post is deleted by trying to fetch it
				await request(app.getHttpServer())
					.get(`/admin/post/${createBody.data.post.id}`)
					.set('Cookie', sessionCookie)
					.expect(400)
			})

			it('editor can delete their own post', async () => {
				// Login as editor
				const editorCookie = await getLoginSession(
					app.getHttpServer(),
					'editor',
					'editor',
				)

				// First create a post as editor
				const createData: CreatePostDTO = {
					title: faker.lorem.sentence({ min: 8, max: 12 }),
					description: faker.lorem.sentences({ min: 1, max: 2 }),
					content: faker.lorem.paragraphs({ min: 2, max: 5 }),
					published: true,
					categoryId: 1,
					seriesId: 1,
				}

				const {
					body: createBody,
				}: { body: SuccessResponse<CreatePostResultDTO> } = await request(
					app.getHttpServer(),
				)
					.post('/admin/post/create')
					.set('Cookie', editorCookie)
					.field({
						...createData,
					})
					.expect(201)

				// Then delete the created post
				const { body } = await request(app.getHttpServer())
					.delete(`/admin/post/${createBody.data.post.id}/delete`)
					.set('Cookie', editorCookie)
					.expect(200)
					.expect('Content-Type', /json/)

				expect(body).toEqual(
					expect.objectContaining<SuccessResponse<DeletePostResultDTO>>({
						success: true,
						data: {
							deletedPost: expect.objectContaining({
								id: createBody.data.post.id,
								title: createData.title,
								description: createData.description,
								content: createData.content,
								author: expect.objectContaining({
									username: 'editor',
								}),
							}),
						},
					}),
				)

				// Verify post is deleted by trying to fetch it
				await request(app.getHttpServer())
					.get(`/admin/post/${createBody.data.post.id}`)
					.set('Cookie', editorCookie)
					.expect(400)
			})
		})

		describe('bad cases', () => {
			it('unauthenticated request', async () => {
				return await request(app.getHttpServer())
					.delete('/admin/post/1/delete')
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

			it('non-existent post ID', async () => {
				return await request(app.getHttpServer())
					.delete('/admin/post/99999/delete')
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
								}),
							}),
						)
					})
			})

			it('invalid post ID format', async () => {
				return await request(app.getHttpServer())
					.delete('/admin/post/invalid-id/delete')
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
								}),
							}),
						)
					})
			})

			it("editor cannot delete another user's post", async () => {
				// Create post as admin
				const createData: CreatePostDTO = {
					title: faker.lorem.sentence({ min: 8, max: 12 }),
					description: faker.lorem.sentences({ min: 1, max: 2 }),
					content: faker.lorem.paragraphs({ min: 2, max: 5 }),
					published: true,
					categoryId: 1,
					seriesId: 1,
				}

				const {
					body: createBody,
				}: { body: SuccessResponse<CreatePostResultDTO> } = await request(
					app.getHttpServer(),
				)
					.post('/admin/post/create')
					.set('Cookie', sessionCookie) // Admin session
					.field({
						...createData,
					})
					.expect(201)

				// Try to delete as editor
				const editorCookie = await getLoginSession(
					app.getHttpServer(),
					'editor',
					'editor',
				)

				return await request(app.getHttpServer())
					.delete(`/admin/post/${createBody.data.post.id}/delete`)
					.set('Cookie', editorCookie)
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

	describe('PATCH /admin/post/:id/update', () => {
		let sessionCookie: string

		beforeEach(async () => {
			sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)
		})

		describe('happy cases', () => {
			test.each<{
				updateFields: Partial<UpdatePostDTO>
				images: ('thumbnail' | 'coverImage')[]
			}>([
				{
					updateFields: {
						title: faker.lorem.sentence(),
						description: faker.lorem.paragraph(),
						content: faker.lorem.paragraphs(),
						published: false,
						categoryId: 1,
						seriesId: 1,
					},
					images: ['thumbnail', 'coverImage'],
				},
				{
					updateFields: {
						title: faker.lorem.sentence(),
						published: true,
					},
					images: ['thumbnail'],
				},
				{
					updateFields: {
						description: faker.lorem.paragraph(),
						content: faker.lorem.paragraphs(),
					},
					images: ['coverImage'],
				},
				{
					updateFields: {
						categoryId: 1,
						seriesId: 1,
					},
					images: [],
				},
			])(
				'update post with fields $updateFields and images $images',
				async ({ updateFields, images }) => {
					// First create a post
					const createData: CreatePostDTO = {
						title: faker.lorem.sentence({ min: 8, max: 12 }),
						description: faker.lorem.sentences({ min: 1, max: 2 }),
						content: faker.lorem.paragraphs({ min: 2, max: 5 }),
						published: true,
					}

					const {
						body: createBody,
					}: { body: SuccessResponse<CreatePostResultDTO> } = await request(
						app.getHttpServer(),
					)
						.post('/admin/post/create')
						.set('Cookie', sessionCookie)
						.field({
							...createData,
						})
						.expect(201)

					const imageMock = {
						fieldname: 'thumbnail',
						originalname: 'thumbnail.jpg',
						buffer: Buffer.from(faker.lorem.words()),
						mimetype: 'image/jpeg',
					} as Express.Multer.File

					// Then update the created post
					let req = request(app.getHttpServer())
						.patch(`/admin/post/${createBody.data.post.id}/update`)
						.set('Cookie', sessionCookie)
						.field({ ...updateFields })

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

					const { body } = await req.expect(200).expect('Content-Type', /json/)
					const updatedData = omit(updateFields, 'categoryId', 'seriesId')

					expect(body).toEqual(
						expect.objectContaining<SuccessResponse<UpdatePostResultDTO>>({
							success: true,
							data: {
								updatedPost: expect.objectContaining<Partial<PostEntity>>({
									id: createBody.data.post.id,
									...updatedData,
									thumbnail: images.includes('thumbnail')
										? expect.any(String)
										: createBody.data.post.thumbnail,
									coverImage: images.includes('coverImage')
										? expect.any(String)
										: createBody.data.post.coverImage,
									category: updateFields.categoryId
										? expect.objectContaining({
												id: updateFields.categoryId,
												name: expect.any(String),
												slug: expect.any(String),
											})
										: null,
									series: updateFields.seriesId
										? expect.objectContaining({
												id: updateFields.seriesId,
												name: expect.any(String),
												slug: expect.any(String),
												description: expect.any(String),
											})
										: null,
								}),
							},
						}),
					)

					// Verify the update by fetching the post
					const { body: fetchedBody } = await request(app.getHttpServer())
						.get(`/admin/post/${createBody.data.post.id}`)
						.set('Cookie', sessionCookie)
						.expect(200)

					expect(fetchedBody.data.post).toEqual(
						expect.objectContaining(body.data.updatedPost),
					)
				},
			)

			it('editor can update their own post', async () => {
				// Login as editor
				const editorCookie = await getLoginSession(
					app.getHttpServer(),
					'editor',
					'editor',
				)

				// First create a post as editor
				const createData: CreatePostDTO = {
					title: faker.lorem.sentence({ min: 8, max: 12 }),
					description: faker.lorem.sentences({ min: 1, max: 2 }),
					content: faker.lorem.paragraphs({ min: 2, max: 5 }),
					published: true,
				}

				const {
					body: createBody,
				}: { body: SuccessResponse<CreatePostResultDTO> } = await request(
					app.getHttpServer(),
				)
					.post('/admin/post/create')
					.set('Cookie', editorCookie)
					.field({
						...createData,
					})
					.expect(201)

				// Update the post
				const updateFields: UpdatePostDTO = {
					title: faker.lorem.sentence(),
					description: faker.lorem.paragraph(),
				}

				const { body } = await request(app.getHttpServer())
					.patch(`/admin/post/${createBody.data.post.id}/update`)
					.set('Cookie', editorCookie)
					.field({ ...updateFields })
					.expect(200)
					.expect('Content-Type', /json/)

				expect(body).toEqual(
					expect.objectContaining<SuccessResponse<UpdatePostResultDTO>>({
						success: true,
						data: {
							updatedPost: expect.objectContaining({
								id: createBody.data.post.id,
								...updateFields,
								author: expect.objectContaining({
									username: 'editor',
								}),
							}),
						},
					}),
				)
			})
		})

		describe('bad cases', () => {
			it('unauthenticated request', async () => {
				return await request(app.getHttpServer())
					.patch('/admin/post/1/update')
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

			it('non-existent post ID', async () => {
				return await request(app.getHttpServer())
					.patch('/admin/post/99999/update')
					.set('Cookie', sessionCookie)
					.field({ title: 'Updated Title' })
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

			it('invalid post ID format', async () => {
				return await request(app.getHttpServer())
					.patch('/admin/post/invalid-id/update')
					.set('Cookie', sessionCookie)
					.field({ title: 'Updated Title' })
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

			it("editor cannot update another user's post", async () => {
				// Create post as admin
				const createData: CreatePostDTO = {
					title: faker.lorem.sentence({ min: 8, max: 12 }),
					description: faker.lorem.sentences({ min: 1, max: 2 }),
					content: faker.lorem.paragraphs({ min: 2, max: 5 }),
					published: true,
				}

				const {
					body: createBody,
				}: { body: SuccessResponse<CreatePostResultDTO> } = await request(
					app.getHttpServer(),
				)
					.post('/admin/post/create')
					.set('Cookie', sessionCookie) // Admin session
					.field({
						...createData,
					})
					.expect(201)

				// Try to update as editor
				const editorCookie = await getLoginSession(
					app.getHttpServer(),
					'editor',
					'editor',
				)

				return await request(app.getHttpServer())
					.patch(`/admin/post/${createBody.data.post.id}/update`)
					.set('Cookie', editorCookie)
					.field({ title: 'Updated Title' })
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

			it('invalid update data', async () => {
				// First create a post
				const createData: CreatePostDTO = {
					title: faker.lorem.sentence({ min: 8, max: 12 }),
					description: faker.lorem.sentences({ min: 1, max: 2 }),
					content: faker.lorem.paragraphs({ min: 2, max: 5 }),
					published: true,
				}

				const {
					body: createBody,
				}: { body: SuccessResponse<CreatePostResultDTO> } = await request(
					app.getHttpServer(),
				)
					.post('/admin/post/create')
					.set('Cookie', sessionCookie)
					.field({
						...createData,
					})
					.expect(201)

				// Try to update with invalid data
				return await request(app.getHttpServer())
					.patch(`/admin/post/${createBody.data.post.id}/update`)
					.set('Cookie', sessionCookie)
					.field({ title: '' }) // Empty title should be invalid
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
		})
	})
})
