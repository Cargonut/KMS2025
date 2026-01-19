import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { join } from 'path';

import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './core/user/user.module';
import { AuthModule } from './auth/auth.module';
import { TripModule } from './core/trip/trip.module';
import { VehicleModule } from './core/vehicle/vehicle.module';
import { TripPassengerModule } from './core/trip-passenger/trip-passenger.module';
import { PaymentModule } from './core/payment/payment.module';
import { TripRatingModule } from './core/trip-rating/trip-rating.module';
import { UploadModule } from './api/rest/upload.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    TripModule,
    TripPassengerModule,
    VehicleModule,
    PaymentModule,
    TripRatingModule,
    UploadModule,

    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      cache: false,
      jit: 0,
      buildSchemaOptions: { dateScalarMode: 'isoDate' },

      // ---------------------------------------------
      // FINAL FUNCTIONING ERROR FORMATTER
      // ---------------------------------------------
      errorFormatter: (executionResult, context) => {
        const { errors, data } = executionResult;

        const formattedErrors = errors.map(err => ({
          message: err.message,
          extensions: err.extensions || {},
        }));

        const statusCode = formattedErrors.length > 0 ? 400 : 200;

        return {
          statusCode,
          response: {
            data,
            errors: formattedErrors,
          },
        };
      },
    }),
  ],
})
export class AppModule {}
