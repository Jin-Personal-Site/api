import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '@/app.module'
import { applyMiddleware, ResponseType } from '@/common'

describe('AppController (e2e)', () => {
	let app: INestApplication

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()

		applyMiddleware(app)
		await app.init()
	})

	it('GET /', async () => {
		return await request(app.getHttpServer())
			.get('/')
			.expect(200)
			.expect('Content-Type', /json/)
			.expect((res) => {
				expect(res.body).toEqual<ResponseType>(
					expect.objectContaining({
						success: true,
					}),
				)
			})
	})
})
