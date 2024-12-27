import * as request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { middlewares } from '@/app.middleware'
import { ErrorResponse, SuccessResponse, getErrorCode } from '@/common'
import { faker } from '@faker-js/faker'
import {
	AllCategoriesOutputDTO,
	CreateCategoryDTO,
	CreateCategoryResultDTO,
	DeleteCategoryResultDTO,
	UpdateCategoryDTO,
	UpdateCategoryResultDTO,
} from '@/shared'
import { CategoryEntity } from '@/entity'

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

describe('CategoryController (e2e)', () => {
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

	describe('GET /admin/category/all', () => {
		it('unauthenticated request', async () => {
			return await request(app.getHttpServer())
				.get('/admin/category/all')
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
				.get('/admin/category/all')
				.set('Cookie', sessionCookie)
				.expect(200)
				.expect('Content-Type', /json/)
				.expect((res) => {
					expect(res.body).toEqual(
						expect.objectContaining<SuccessResponse<AllCategoriesOutputDTO>>({
							success: true,
							data: {
								categories: expect.arrayContaining([
									expect.objectContaining<Partial<CategoryEntity>>({
										id: expect.any(Number),
										name: expect.any(String),
										slug: expect.any(String),
										color: expect.any(String),
										createdAt: expect.any(String),
									}),
								]),
							},
						}),
					)
				})
		})

		it('should return cached categories on subsequent requests', async () => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			// First request - cache miss
			const firstResponse = await request(app.getHttpServer())
				.get('/admin/category/all')
				.set('Cookie', sessionCookie)
				.expect(200)

			// Second request - should hit cache
			const secondResponse = await request(app.getHttpServer())
				.get('/admin/category/all')
				.set('Cookie', sessionCookie)
				.expect(200)

			expect(firstResponse.body?.data).toEqual(secondResponse.body?.data)
		})

		it('should invalidate cache after category creation', async () => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			// Get initial categories
			const initialResponse = await request(app.getHttpServer())
				.get('/admin/category/all')
				.set('Cookie', sessionCookie)
				.expect(200)

			// Create new category
			const createData: CreateCategoryDTO = {
				name: faker.lorem.words(2),
				slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
			}

			await request(app.getHttpServer())
				.post('/admin/category/create')
				.set('Cookie', sessionCookie)
				.send(createData)
				.expect(201)

			// Get categories again - should be a cache miss due to invalidation
			const afterCreateResponse = await request(app.getHttpServer())
				.get('/admin/category/all')
				.set('Cookie', sessionCookie)
				.expect(200)

			expect(afterCreateResponse.body.data.categories.length).toBe(
				initialResponse.body.data.categories.length + 1,
			)
		})
	})

	describe('POST /admin/category/create', () => {
		describe('happy cases', () => {
			it('create category with all fields', async () => {
				const sessionCookie = await getLoginSession(
					app.getHttpServer(),
					username,
					password,
				)

				const createData: CreateCategoryDTO = {
					name: faker.lorem.words(2),
					slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
					color: '#FF5733',
				}

				return await request(app.getHttpServer())
					.post('/admin/category/create')
					.set('Cookie', sessionCookie)
					.send(createData)
					.expect(201)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body).toEqual(
							expect.objectContaining<SuccessResponse<CreateCategoryResultDTO>>(
								{
									success: true,
									data: {
										category: expect.objectContaining({
											id: expect.any(Number),
											name: createData.name,
											slug: createData.slug,
											color: createData.color,
											createdAt: expect.any(String),
										}),
									},
								},
							),
						)
					})
			})

			it('create category without optional color', async () => {
				const sessionCookie = await getLoginSession(
					app.getHttpServer(),
					username,
					password,
				)

				const createData: CreateCategoryDTO = {
					name: faker.lorem.words(2),
					slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
				}

				return await request(app.getHttpServer())
					.post('/admin/category/create')
					.set('Cookie', sessionCookie)
					.send(createData)
					.expect(201)
					.expect('Content-Type', /json/)
					.expect((res) => {
						expect(res.body.data.category).toEqual(
							expect.objectContaining({
								name: createData.name,
								slug: createData.slug,
								color: null,
							}),
						)
					})
			})
		})

		describe('bad cases', () => {
			it('unauthenticated request', async () => {
				const createData: CreateCategoryDTO = {
					name: faker.lorem.words(2),
					slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
				}

				return await request(app.getHttpServer())
					.post('/admin/category/create')
					.send(createData)
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

				const createData: CreateCategoryDTO = {
					name: faker.lorem.words(2),
					slug: 'Invalid Slug With Spaces',
					color: '#FF5733',
				}

				return await request(app.getHttpServer())
					.post('/admin/category/create')
					.set('Cookie', sessionCookie)
					.send(createData)
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

			it('invalid color format', async () => {
				const sessionCookie = await getLoginSession(
					app.getHttpServer(),
					username,
					password,
				)

				const createData: CreateCategoryDTO = {
					name: faker.lorem.words(2),
					slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
					color: 'invalid-color',
				}

				return await request(app.getHttpServer())
					.post('/admin/category/create')
					.set('Cookie', sessionCookie)
					.send(createData)
					.expect(400)
			})
		})
	})

	describe('DELETE /admin/category/delete', () => {
		it('delete existing category', async () => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			// First create a category
			const createData: CreateCategoryDTO = {
				name: faker.lorem.words(2),
				slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
			}

			const createRes = await request(app.getHttpServer())
				.post('/admin/category/create')
				.set('Cookie', sessionCookie)
				.send(createData)
				.expect(201)

			const categoryId = createRes.body.data.category.id

			// Then delete it
			return await request(app.getHttpServer())
				.delete(`/admin/category/${categoryId}/delete`)
				.set('Cookie', sessionCookie)
				.expect(200)
				.expect('Content-Type', /json/)
				.expect((res) => {
					expect(res.body).toEqual(
						expect.objectContaining<SuccessResponse<DeleteCategoryResultDTO>>({
							success: true,
							data: {
								deletedCategory: expect.objectContaining({
									id: categoryId,
									name: createData.name,
									slug: createData.slug,
								}),
							},
						}),
					)
				})
		})

		it('delete non-existent category', async () => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			return await request(app.getHttpServer())
				.delete('/admin/category/99999/delete')
				.set('Cookie', sessionCookie)
				.expect(400)
				.expect('Content-Type', /json/)
				.expect((res) => {
					expect(res.body).toEqual(
						expect.objectContaining<ErrorResponse>({
							success: false,
							error: expect.objectContaining({
								code: getErrorCode(400),
								message: expect.any(String),
							}),
						}),
					)
				})
		})

		it('cannot delete category with associated posts', async () => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			// First create a category
			const createData: CreateCategoryDTO = {
				name: faker.lorem.words(2),
				slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
			}

			const createRes = await request(app.getHttpServer())
				.post('/admin/category/create')
				.set('Cookie', sessionCookie)
				.send(createData)
				.expect(201)

			const categoryId = createRes.body.data.category.id

			// Create a post with this category
			const postData = {
				title: faker.lorem.sentence(),
				description: faker.lorem.paragraph(),
				content: faker.lorem.paragraphs(2),
				categoryId: categoryId,
				published: true,
			}

			await request(app.getHttpServer())
				.post('/admin/post/create')
				.set('Cookie', sessionCookie)
				.field(postData)
				.expect(201)

			// Try to delete the category
			return await request(app.getHttpServer())
				.delete(`/admin/category/${categoryId}/delete`)
				.set('Cookie', sessionCookie)
				.expect(400)
				.expect('Content-Type', /json/)
				.expect((res) => {
					expect(res.body).toEqual(
						expect.objectContaining<ErrorResponse>({
							success: false,
							error: expect.objectContaining({
								code: getErrorCode(400),
								message: 'Cannot delete category having posts',
							}),
						}),
					)
				})
		})

		it('should invalidate cache after successful deletion', async () => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			// Create a category
			const createData: CreateCategoryDTO = {
				name: faker.lorem.words(2),
				slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
			}

			const createRes = await request(app.getHttpServer())
				.post('/admin/category/create')
				.set('Cookie', sessionCookie)
				.send(createData)
				.expect(201)

			const categoryId = createRes.body.data.category.id

			// Get initial categories count
			const initialResponse = await request(app.getHttpServer())
				.get('/admin/category/all')
				.set('Cookie', sessionCookie)
				.expect(200)

			// Delete the category
			await request(app.getHttpServer())
				.delete(`/admin/category/${categoryId}/delete`)
				.set('Cookie', sessionCookie)
				.expect(200)

			// Get categories again - should be a cache miss due to invalidation
			const afterDeleteResponse = await request(app.getHttpServer())
				.get('/admin/category/all')
				.set('Cookie', sessionCookie)
				.expect(200)

			expect(afterDeleteResponse.body.data.categories.length).toBe(
				initialResponse.body.data.categories.length - 1,
			)
		})
	})

	describe('PATCH /admin/category/update', () => {
		it('update existing category', async () => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			// First create a category
			const createData: CreateCategoryDTO = {
				name: faker.lorem.words(2),
				slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
			}

			const createRes = await request(app.getHttpServer())
				.post('/admin/category/create')
				.set('Cookie', sessionCookie)
				.send(createData)
				.expect(201)

			const categoryId = createRes.body.data.category.id

			// Then update it
			const updateData: UpdateCategoryDTO = {
				name: faker.lorem.words(2),
				color: '#000000',
			}

			return await request(app.getHttpServer())
				.patch(`/admin/category/${categoryId}/update`)
				.set('Cookie', sessionCookie)
				.send(updateData)
				.expect(200)
				.expect('Content-Type', /json/)
				.expect((res) => {
					expect(res.body).toEqual(
						expect.objectContaining<SuccessResponse<UpdateCategoryResultDTO>>({
							success: true,
							data: {
								updatedCategory: expect.objectContaining({
									id: categoryId,
									name: updateData.name,
									color: updateData.color,
									slug: createData.slug, // Slug remains unchanged
								}),
							},
						}),
					)
				})
		})

		it('update non-existent category', async () => {
			const sessionCookie = await getLoginSession(
				app.getHttpServer(),
				username,
				password,
			)

			const updateData: UpdateCategoryDTO = {
				name: faker.lorem.words(2),
			}

			return await request(app.getHttpServer())
				.patch('/admin/category/99999/update')
				.set('Cookie', sessionCookie)
				.send(updateData)
				.expect(400)
				.expect('Content-Type', /json/)
				.expect((res) => {
					expect(res.body).toEqual(
						expect.objectContaining<ErrorResponse>({
							success: false,
							error: expect.objectContaining({
								code: getErrorCode(400),
								message: expect.any(String),
							}),
						}),
					)
				})
		})
	})
})
