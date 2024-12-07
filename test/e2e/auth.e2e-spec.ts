import * as request from 'supertest'

import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ResponseType } from '@/common'
import { AuthModule } from '@/auth'
import { AppModule } from '@/app.module'
import 'jest-extended'
import { middlewares } from '@/app.middleware'

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

	it('POST /admin/login', async () => {
		const res = await request(app.getHttpServer())
			.post('/admin/login')
			.send({ username, password })
			.expect(201)
			.expect('Content-Type', /json/)
			.expect('Set-Cookie', /^connect\.sid=/)

		sessionCookie = res.headers['set-cookie'][0]

		expect(res.body).toMatchObject<
			ResponseType<{ user: Partial<Express.User> }>
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

	it('GET /admin/me', async () => {
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

	it('POST /admin/logout', async () => {
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
