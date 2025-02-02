import * as request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { middlewares } from '@/app.middleware'
import { ErrorResponse, SuccessResponse, getErrorCode } from '@/common'
import { faker } from '@faker-js/faker'
import {
	AllSeriesOutputDTO,
	CreateSeriesDTO,
	CreateSeriesResultDTO,
	DeleteSeriesResultDTO,
	UpdateSeriesDTO,
	UpdateSeriesResultDTO,
} from '@/shared'
import { SeriesEntity } from '@/entity'

const getLoginSession = async (
	app: any,
	username: string,
	password: string,
) => {
	const loginRes = await request(app)
		.post('/admin/login')
		.send({ username, password })
		.expect(201)
		.expect('Set-Cookie', /^connect\.sid=/)
	return loginRes.headers['set-cookie'][0]
}

describe('SeriesController (e2e)', () => {
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

	describe('GET /admin/series/all', () => {
		it('unauthenticated request', async () => {
			return await request(app.getHttpServer())
				.get('/admin/series/all')
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

		it('authenticated request', async () => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			return await request(app.getHttpServer())
				.get('/admin/series/all')
				.set('Cookie', sessionCookie)
				.expect(200)
				.expect('Content-Type', /json/)
				.expect((res) => {
					expect(res.body).toEqual(
						expect.objectContaining<SuccessResponse<AllSeriesOutputDTO>>({
							success: true,
							data: {
								series: expect.arrayContaining([
									expect.objectContaining<Partial<SeriesEntity>>({
										id: expect.any(Number),
										name: expect.any(String),
										slug: expect.any(String),
										description: expect.any(String),
										createdAt: expect.any(String),
									}),
								]),
							},
						}),
					)
				})
		})

		it('should return cached series on subsequent requests', async () => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			// First request - cache miss
			const firstResponse = await request(app.getHttpServer())
				.get('/admin/series/all')
				.set('Cookie', sessionCookie)
				.expect(200)

			// Second request - should hit cache
			const secondResponse = await request(app.getHttpServer())
				.get('/admin/series/all')
				.set('Cookie', sessionCookie)
				.expect(200)

			expect(firstResponse.body?.data).toEqual(secondResponse.body?.data)
		})

		it('should invalidate cache after series creation', async () => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			// Get initial series
			const initialResponse = await request(app.getHttpServer())
				.get('/admin/series/all')
				.set('Cookie', sessionCookie)
				.expect(200)

			// Create new series
			const createData: CreateSeriesDTO = {
				name: faker.lorem.words(2),
				slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
				description: faker.lorem.sentences({ min: 1, max: 2 }),
			}

			const imageMock = {
				fieldname: 'thumbnail',
				originalname: 'thumbnail.jpg',
				buffer: Buffer.from(faker.lorem.words()),
				mimetype: 'image/jpeg',
			} as Express.Multer.File

			await request(app.getHttpServer())
				.post('/admin/series/create')
				.set('Cookie', sessionCookie)
				.field({ ...createData })
				.attach('thumbnail', imageMock.buffer, {
					filename: imageMock.originalname,
					contentType: imageMock.mimetype,
				})
				.expect(201)

			// Get series again - should be a cache miss due to invalidation
			const afterCreateResponse = await request(app.getHttpServer())
				.get('/admin/series/all')
				.set('Cookie', sessionCookie)
				.expect(200)

			expect(afterCreateResponse.body.data.series.length).toBe(
				initialResponse.body.data.series.length + 1,
			)
		})
	})

	describe('POST /admin/series/create', () => {
		describe('happy cases', () => {
			it('create series with all fields and thumbnail', async () => {
				const sessionCookie = await getLoginSession(
					app.getHttpServer(),
					username,
					password,
				)

				const createData: CreateSeriesDTO = {
					name: faker.lorem.words(2),
					slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
					description: faker.lorem.words({ min: 5, max: 10 }),
				}
				console.log(createData)

				const imageMock = {
					fieldname: 'thumbnail',
					originalname: 'thumbnail.jpg',
					buffer: Buffer.from(faker.lorem.words()),
					mimetype: 'image/jpeg',
				} as Express.Multer.File

				return await request(app.getHttpServer())
					.post('/admin/series/create')
					.set('Cookie', sessionCookie)
					.field({ ...createData })
					.attach('thumbnail', imageMock.buffer, {
						filename: imageMock.originalname,
						contentType: imageMock.mimetype,
					})
					.expect(201)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body).toEqual(
							expect.objectContaining<SuccessResponse<CreateSeriesResultDTO>>({
								success: true,
								data: {
									series: expect.objectContaining({
										id: expect.any(Number),
										name: createData.name,
										slug: createData.slug,
										description: createData.description,
										thumbnail: expect.any(String),
										createdAt: expect.any(String),
									}),
								},
							}),
						)
					})
			})

			it('create series without thumbnail', async () => {
				const sessionCookie = await getLoginSession(
					app.getHttpServer(),
					username,
					password,
				)

				const createData: CreateSeriesDTO = {
					name: faker.lorem.words(2),
					slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
					description: faker.lorem.sentences(1),
				}

				return await request(app.getHttpServer())
					.post('/admin/series/create')
					.set('Cookie', sessionCookie)
					.field({ ...createData })
					.expect(201)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body.data.series).toEqual(
							expect.objectContaining({
								name: createData.name,
								slug: createData.slug,
								description: createData.description,
								thumbnail: null,
							}),
						)
					})
			})
		})

		describe('bad cases', () => {
			it('unauthenticated request', async () => {
				const createData: CreateSeriesDTO = {
					name: faker.lorem.words(2),
					slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
					description: faker.lorem.sentences(1),
				}

				return await request(app.getHttpServer())
					.post('/admin/series/create')
					.field({ ...createData })
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

			it('invalid slug format', async () => {
				const sessionCookie = await getLoginSession(
					app.getHttpServer(),
					username,
					password,
				)

				const createData: CreateSeriesDTO = {
					name: faker.lorem.words(2),
					slug: 'Invalid Slug With Spaces',
					description: faker.lorem.sentences(1),
				}

				return await request(app.getHttpServer())
					.post('/admin/series/create')
					.set('Cookie', sessionCookie)
					.field({ ...createData })
					.expect(400)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body).toEqual(
							expect.objectContaining<ErrorResponse>({
								success: false,
								error: expect.objectContaining({
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

	describe('DELETE /admin/series/delete', () => {
		describe('happy cases', () => {
			it('should delete an existing series', async () => {
				const sessionCookie = await getLoginSession(
					app.getHttpServer(),
					username,
					password,
				)

				// First create a series to delete
				const createData: CreateSeriesDTO = {
					name: faker.lorem.words(2),
					slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
					description: faker.lorem.sentences(1),
				}

				const createResponse = await request(app.getHttpServer())
					.post('/admin/series/create')
					.set('Cookie', sessionCookie)
					.field({ ...createData })
					.expect(201)

				const seriesId = createResponse.body.data.series.id

				// Then delete it
				return await request(app.getHttpServer())
					.delete(`/admin/series/${seriesId}/delete`)
					.set('Cookie', sessionCookie)
					.expect(200)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body).toEqual(
							expect.objectContaining<SuccessResponse<DeleteSeriesResultDTO>>({
								success: true,
								data: {
									deletedSeries: expect.objectContaining({
										id: seriesId,
										name: createData.name,
										slug: createData.slug,
										description: createData.description,
									}),
								},
							}),
						)
					})
			})
		})

		describe('bad cases', () => {
			it('unauthenticated request', async () => {
				return await request(app.getHttpServer())
					.delete('/admin/series/99999/delete')
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

			it('non-existent series id', async () => {
				const sessionCookie = await getLoginSession(
					app.getHttpServer(),
					username,
					password,
				)

				return await request(app.getHttpServer())
					.delete('/admin/series/99999/delete')
					.set('Cookie', sessionCookie)
					.expect(400)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body).toEqual(
							expect.objectContaining<ErrorResponse>({
								success: false,
								error: expect.objectContaining({
									code: getErrorCode(400),
									message: 'Not found series',
								}),
							}),
						)
					})
			})
		})
	})

	describe('PATCH /admin/series/:id/update', () => {
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
				updateFields: Partial<UpdateSeriesDTO>
				withThumbnail: boolean
			}>([
				{
					updateFields: {
						name: faker.lorem.words(2),
						slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
						description: faker.lorem.sentences({ min: 1, max: 2 }),
					},
					withThumbnail: true,
				},
				{
					updateFields: {
						name: faker.lorem.words(2),
						description: faker.lorem.sentences({ min: 1, max: 2 }),
					},
					withThumbnail: false,
				},
				{
					updateFields: {
						slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
					},
					withThumbnail: true,
				},
			])(
				'update series with fields $updateFields and thumbnail: $withThumbnail',
				async ({ updateFields, withThumbnail }) => {
					// First create a series
					const createData: CreateSeriesDTO = {
						name: faker.lorem.words(2),
						slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
						description: faker.lorem.sentences(1),
					}

					const createResponse = await request(app.getHttpServer())
						.post('/admin/series/create')
						.set('Cookie', sessionCookie)
						.field({ ...createData })
						.expect(201)

					const seriesId = createResponse.body.data.series.id

					// Update the series
					const imageMock = {
						fieldname: 'thumbnail',
						originalname: 'thumbnail.jpg',
						buffer: Buffer.from(faker.lorem.words()),
						mimetype: 'image/jpeg',
					} as Express.Multer.File

					let req = request(app.getHttpServer())
						.patch(`/admin/series/${seriesId}/update`)
						.set('Cookie', sessionCookie)
						.field({ ...updateFields })

					if (withThumbnail) {
						req = req.attach('thumbnail', imageMock.buffer, {
							filename: imageMock.originalname,
							contentType: imageMock.mimetype,
						})
					}

					const { body } = await req.expect(200).expect('Content-Type', /json/)

					expect(body).toEqual(
						expect.objectContaining<SuccessResponse<UpdateSeriesResultDTO>>({
							success: true,
							data: {
								updatedSeries: expect.objectContaining({
									id: seriesId,
									...updateFields,
									thumbnail: withThumbnail
										? expect.any(String)
										: createResponse.body.data.series.thumbnail,
								}),
							},
						}),
					)

					// Verify the update by fetching the series
					const { body: fetchedBody } = await request(app.getHttpServer())
						.get('/admin/series/all')
						.set('Cookie', sessionCookie)
						.expect(200)

					const updatedSeries = fetchedBody.data.series.find(
						(s: SeriesEntity) => s.id === seriesId,
					)
					expect(updatedSeries).toEqual(
						expect.objectContaining(body.data.updatedSeries),
					)
				},
			)
		})

		describe('bad cases', () => {
			it('unauthenticated request', async () => {
				return await request(app.getHttpServer())
					.patch('/admin/series/1/update')
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

			it('non-existent series id', async () => {
				return await request(app.getHttpServer())
					.patch('/admin/series/99999/update')
					.set('Cookie', sessionCookie)
					.field({
						name: faker.lorem.words(2),
					})
					.expect(400)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body).toEqual(
							expect.objectContaining<ErrorResponse>({
								success: false,
								error: expect.objectContaining({
									code: getErrorCode(400),
									message: 'Not found series',
								}),
							}),
						)
					})
			})

			it('invalid slug format', async () => {
				// First create a series
				const createData: CreateSeriesDTO = {
					name: faker.lorem.words(2),
					slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
					description: faker.lorem.sentence(1),
				}

				const createResponse = await request(app.getHttpServer())
					.post('/admin/series/create')
					.set('Cookie', sessionCookie)
					.field({ ...createData })
					.expect(201)

				const seriesId = createResponse.body.data.series.id

				// Try to update with invalid slug
				return await request(app.getHttpServer())
					.patch(`/admin/series/${seriesId}/update`)
					.set('Cookie', sessionCookie)
					.field({
						slug: 'Invalid Slug With Spaces',
					})
					.expect(400)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body).toEqual(
							expect.objectContaining<ErrorResponse>({
								success: false,
								error: expect.objectContaining({
									code: getErrorCode(400),
									message: expect.any(String),
									details: expect.any(Array),
								}),
							}),
						)
					})
			})

			it('invalid update data', async () => {
				// First create a series
				const createData: CreateSeriesDTO = {
					name: faker.lorem.words(2),
					slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
					description: faker.lorem.sentences({ min: 1, max: 2 }),
				}

				const createResponse = await request(app.getHttpServer())
					.post('/admin/series/create')
					.set('Cookie', sessionCookie)
					.field({ ...createData })
					.expect(201)

				const seriesId = createResponse.body.data.series.id

				// Try to update with invalid data
				return await request(app.getHttpServer())
					.patch(`/admin/series/${seriesId}/update`)
					.set('Cookie', sessionCookie)
					.field({ name: '' }) // Empty name should be invalid
					.expect(400)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body).toEqual(
							expect.objectContaining<ErrorResponse>({
								success: false,
								error: expect.objectContaining({
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
