import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {

    let message = 'Database error';
    let statusCode = HttpStatus.BAD_REQUEST;

    // Prisma Duplicate Error P2002
    if (exception.code === 'P2002') {
      const field = exception.meta?.target?.[0];

      if (field === 'email') {
        message = 'Email already taken.';
      } else {
        message = `Duplicate value for field: ${field}`;
      }
    }

    // ---------------------------
    // GRAPHQL CONTEXT
    // ---------------------------
    const gqlHost = GqlArgumentsHost.create(host);

    if (gqlHost.getInfo()) {
      // GraphQL Fehlerantwort
      return {
        message,
        extensions: {
          code: 'BAD_USER_INPUT',
          statusCode,
        },
      };
    }

    // ---------------------------
    // HTTP CONTEXT (REST)
    // ---------------------------
    const http = host.switchToHttp();
    const response = http.getResponse();

    return response.status(statusCode).json({
      statusCode,
      message,
      error: 'Bad Request',
    });
  }
}
