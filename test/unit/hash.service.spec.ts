import { HashService } from '@/auth'

describe('HashService', () => {
	let hashService: HashService

	beforeEach(() => {
		hashService = new HashService()
	})

	it('Hash with default salt', () => {
		const password = 'admin'

		const hash = hashService.hash(password)
		expect(hash).not.toEqual(password)
		const compareResult = hashService.compare(password, hash)
		expect(compareResult).toBeTruthy()
	})

	it('Hash with gen salt', () => {
		const password = 'admin'

		// Hash and compare with 1st salt
		const hash = hashService.hash(password, true)
		expect(hash).not.toEqual(password)
		const compareResult = hashService.compare(password, hash)
		expect(compareResult).toBeTruthy()

		// Hash and compare with 2nd salt
		const hash2 = hashService.hash(password, true)
		expect(hash2).not.toEqual(password)
		const compareResult2 = hashService.compare(password, hash2)
		expect(compareResult2).toBeTruthy()

		// Assert 2 hashes are distinguish because of 2 different salts
		expect(hash2).not.toEqual(hash)
	})
})
