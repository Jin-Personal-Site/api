import { Global, Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { LocalStrategy } from './strategies'
import { SessionSerializer } from './session.serializer'
import { HashService } from './hash.service'

@Global()
@Module({
	imports: [PassportModule.register({ session: true })],
	providers: [AuthService, LocalStrategy, SessionSerializer, HashService],
})
export class AuthModule {}
