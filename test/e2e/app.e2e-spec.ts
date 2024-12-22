import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '@/app.module'
import { middlewares } from '@/app.middleware'
import { SuccessResponse } from '@/common'

describe('AppController (e2e)', () => {
	let app: INestApplication

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()

		middlewares(app)
		await app.init()
	})

	it('GET /', async () => {
		return await request(app.getHttpServer())
			.get('/')
			.expect(200)
			.expect('Content-Type', /json/)
			.expect((res) => {
				expect(res.body).toEqual<SuccessResponse>(
					expect.objectContaining({
						success: true,
					}),
				)
			})
	})
})
