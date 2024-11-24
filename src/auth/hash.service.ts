import * as bcrypt from 'bcryptjs'
import { Injectable } from '@nestjs/common'

@Injectable()
export class HashService {
	private saltRounds: string | number
	constructor() {
		this.saltRounds = 10
	}

	hash(plainText: string, genSalt = false) {
		if (!genSalt) {
			return bcrypt.hashSync(plainText, this.saltRounds)
		}

		const salt = bcrypt.genSaltSync(
			typeof this.saltRounds === 'number' ? this.saltRounds : 10,
		)
		return bcrypt.hashSync(plainText, salt)
	}

	compare(plainText: string, hash: string) {
		return bcrypt.compareSync(plainText, hash)
	}
}
