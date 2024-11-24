import { Strategy } from 'passport-local'
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super()
	}

	async validate(username: string, password: string) {
		try {
			const user = await this.authService.validateAdminUser(username, password)
			return user
		} catch (exception) {
			Logger.debug(exception?.message, exception?.stack, exception?.name)
			throw new UnauthorizedException('Invalid credentials')
		}
	}
}
