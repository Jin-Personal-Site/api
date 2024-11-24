import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class LocalGuard extends AuthGuard('local') {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		// First validate the credentials using the local strategy
		const result: boolean = (await super.canActivate(context)) as boolean

		// Responsible for establishing a persistent user session:
		// - Takes the authenticated user from the request
		// - Calls serializeUser (in SessionSerializer) to determine what user data to store
		// - Creates a session containing the serialized user data
		// - Sets a session cookie in the response headers
		await super.logIn(context.switchToHttp().getRequest())

		return result
	}
}
