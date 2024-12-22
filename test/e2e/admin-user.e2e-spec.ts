import * as request from 'supertest'

import { AppModule } from '@/app.module'
import { ErrorResponse, SuccessResponse } from '@/common'
import { AllAdminUsersOutputDTO } from '@/shared'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { $Enums } from '@prisma/client'
import { middlewares } from '@/app.middleware'

describe('AdminUserController (e2e)', () => {
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

	describe('GET /admin/user/all', () => {
		it('unauthenticated', async () => {
			return await request(app.getHttpServer())
				.get('/admin/user/all')
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

		it('authenticated', async () => {
			const loginRes = await request(app.getHttpServer())
				.post('/admin/login')
				.send({ username, password })
				.expect(201)
				.expect('Set-Cookie', /^connect\.sid=/)
			const sessionCookie = loginRes.headers['set-cookie'][0]

			return await request(app.getHttpServer())
				.get('/admin/user/all')
				.set('Cookie', sessionCookie)
				.expect(200)
				.expect('Content-Type', /json/)
				.expect((res) => {
					expect(res.body).toEqual(
						expect.objectContaining<SuccessResponse<AllAdminUsersOutputDTO>>({
							success: true,
							data: {
								users: expect.any(Array),
							},
						}),
					)
					;(
						res.body as SuccessResponse<AllAdminUsersOutputDTO>
					)?.data?.users.forEach((user) => {
						expect(user).toMatchObject(
							expect.objectContaining({
								id: expect.any(Number),
								username: expect.any(String),
								name: expect.any(String),
								role: expect.stringMatching(
									new RegExp(`^${Object.values($Enums.Role).join('|')}$`),
								),
								createdAt: expect.any(String),
							}),
						)
					})
				})
		})
	})
})
