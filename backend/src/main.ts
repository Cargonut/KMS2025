import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // ---------------------------------------------------
  // 🔍 GLOBAL VALIDATION PIPE
  // ---------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
    }),
  );

  // ---------------------------------------------------
  // 🔍 GLOBAL FILTERS
  // Reihenfolge wichtig:
  // 1. Prisma Errors (z.B. Unique Constraint)
  // 2. Validation Errors (DTO Errors)
  // ---------------------------------------------------
  app.useGlobalFilters(
    new PrismaExceptionFilter(),
    new ValidationExceptionFilter(),
  );

  // ---------------------------------------------------
  // 🔓 CORS
  // ---------------------------------------------------
  app.enableCors({
    origin: '*',
  });

  // ---------------------------------------------------
  // 📁 MULTIPART HANDLING (für Uploads)
  // ---------------------------------------------------
  await app.register(multipart);

  // ---------------------------------------------------
  // 📁 STATIC FILE SERVING (Uploads)
  // ---------------------------------------------------
  await app.register(fastifyStatic, {
    root: join(__dirname, '..', 'uploads'),
    prefix: '/uploads/',
  });

  // ---------------------------------------------------
  // 🚀 START APPLICATION
  // ---------------------------------------------------
  await app.listen(3000, '0.0.0.0');
}

bootstrap();
