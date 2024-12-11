import * as request from 'supertest'

import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from '@/auth'
import { AppModule } from '@/app.module'
import 'jest-extended'
import { middlewares } from '@/app.middleware'
import { SuccessResponse } from '@/common'

describe('AuthController (e2e)', () => {
	let app: INestApplication
	let sessionCookie
	const username = 'admin'
	const password = 'admin'

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		middlewares(app)
		await app.init()
	})

	it('POST /api/admin/login', async () => {
		const res = await request(app.getHttpServer())
			.post('/api/admin/login')
			.send({ username, password })
			.expect(201)
			.expect('Content-Type', /json/)
			.expect('Set-Cookie', /^connect\.sid=/)

		sessionCookie = res.headers['set-cookie'][0]

		expect(res.body).toMatchObject<
			SuccessResponse<{ user: Partial<Express.User> }>
		>(
			expect.objectContaining({
				success: true,
				data: expect.objectContaining({
					user: expect.objectContaining({
						id: expect.any(Number),
						username: username,
						role: expect.stringMatching(/ADMIN|EDITOR/),
					}),
				}),
			}),
		)
	})

	it('GET /api/admin/me', async () => {
		await request(app.getHttpServer())
			.get('/api/admin/me')
			.set('Cookie', sessionCookie)
			.expect(200)
			.expect((res) => {
				expect(res.body).toMatchObject<ResponseType>(
					expect.objectContaining({
						success: true,
						data: expect.objectContaining({
							user: expect.objectContaining({
								id: expect.any(Number),
								username: username,
								role: expect.stringMatching(/ADMIN|EDITOR/),
							}),
						}),
					}),
				)
			})
	})

	it('POST /api/admin/logout', async () => {
		await request(app.getHttpServer())
			.post('/api/admin/logout')
			.set('Cookie', sessionCookie)
			.expect(201)
			.expect((res) => {
				expect(res.body).toMatchObject<ResponseType>(
					expect.objectContaining({
						success: true,
					}),
				)
			})
	})
})
