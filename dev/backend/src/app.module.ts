import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { join } from 'path';

import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './core/user/user.module';
import { AuthModule } from './auth/auth.module';
import { TripModule } from './core/trip/trip.module';
import { VehicleModule } from './core/vehicle/vehicle.module';
import { UploadModule } from './api/rest/upload.module';

@Module({
  imports: [
    PrismaModule,

    // Reihenfolge: User vor Auth ist korrekt
    UserModule,
    AuthModule,

    TripModule,
    VehicleModule,
    UploadModule,

    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      cache: false,
      jit: 0,
      buildSchemaOptions: { dateScalarMode: 'isoDate' },

      // ---------------------------------------------
      // 🔥 CUSTOM ERROR FORMATTER (Mercurius)
      // ---------------------------------------------
      errorFormatter: (executionResult: any, context) => {
        const error = executionResult.errors?.[0];
        const original = error?.originalError as any;

        // Prisma Unique Constraint Error (P2002)
        if (original?.code === 'P2002') {
          const field = original.meta?.target?.[0] ?? 'field';
          const message =
            field === 'email'
              ? 'Email already taken.'
              : `Duplicate value for field: ${field}`;

          return {
            statusCode: 400,
            response: {
              errors: [{ message }],
            },
          };
        }

        // Prisma Record Not Found (P2025)
        if (original?.code === 'P2025') {
          return {
            statusCode: 404,
            response: {
              errors: [{ message: 'Record not found.' }],
            },
          };
        }

        // Default GraphQL/NestJS Error
        return {
          statusCode: 500,
          response: {
            errors: [{ message: error?.message ?? 'Internal Server Error' }],
          },
        };
      },

    }),
  ],
})
export class AppModule { }
