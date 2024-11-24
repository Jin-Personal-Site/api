import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { LocalStrategy } from './strategies'
import { SessionSerializer } from './session.serializer'
import { AuthController } from './auth.controller'
import { HashService } from './hash.service'

@Module({
	imports: [PassportModule.register({ session: true })],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, SessionSerializer, HashService],
})
export class AuthModule {}
