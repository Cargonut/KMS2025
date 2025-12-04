import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserResolver } from '../../api/graphql/user.resolver';
import { UserService } from './user.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,          // ❗ KEIN forwardRef HIER!
  ],
  providers: [
    UserService,
    UserResolver,
  ],
  exports: [UserService],
})
export class UserModule {}
