import { Injectable } from '@nestjs/common'
import { PassportSerializer } from '@nestjs/passport'

type DoneCallback = (err: any, user: any) => void

@Injectable()
export class SessionSerializer extends PassportSerializer {
	serializeUser(user: any, done: DoneCallback) {
		done(null, user)
	}
	deserializeUser(payload: any, done: DoneCallback) {
		done(null, payload)
	}
}
