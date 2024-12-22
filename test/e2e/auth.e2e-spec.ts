import * as request from 'supertest'

import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from '@/auth'
import { AppModule } from '@/app.module'
import { middlewares } from '@/app.middleware'
import { ErrorResponse, SuccessResponse } from '@/common'

describe('AuthController (e2e)', () => {
	let app: INestApplication
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

	describe('POST /login', () => {
		it('successful', async () => {
			const res = await request(app.getHttpServer())
				.post('/admin/login')
				.send({ username, password })
				.expect(201)
				.expect('Content-Type', /json/)
				.expect('Set-Cookie', /^connect\.sid=/)

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

		it('wrong password', async () => {
			return await request(app.getHttpServer())
				.post('/admin/login')
				.send({ username, password: password + '123' })
				.expect(401)
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

		it('wrong username/password', async () => {
			return await request(app.getHttpServer())
				.post('/admin/login')
				.send({ username: username + 123, password: password + 123 })
				.expect(401)
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
	})

	it('GET /me', async () => {
		const loginRes = await request(app.getHttpServer())
			.post('/admin/login')
			.send({ username, password })
			.expect(201)
			.expect('Content-Type', /json/)
			.expect('Set-Cookie', /^connect\.sid=/)

		const sessionCookie = loginRes.headers['set-cookie'][0]

		await request(app.getHttpServer())
			.get('/admin/me')
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

	it('POST /logout', async () => {
		const loginRes = await request(app.getHttpServer())
			.post('/admin/login')
			.send({ username, password })
			.expect(201)
			.expect('Content-Type', /json/)
			.expect('Set-Cookie', /^connect\.sid=/)

		const sessionCookie = loginRes.headers['set-cookie'][0]

		await request(app.getHttpServer())
			.post('/admin/logout')
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
