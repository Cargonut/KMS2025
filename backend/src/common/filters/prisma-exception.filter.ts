import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    let message = 'Database error';
    let statusCode = HttpStatus.BAD_REQUEST;
    let fieldErrors: Record<string, string[]> | null = null;

    // -------------------------------------
    // 🔥 Prisma P2002 – Unique Constraint
    // -------------------------------------
    if (exception.code === 'P2002') {
      const field = exception.meta?.target?.[0] ?? 'field';

      statusCode = HttpStatus.BAD_REQUEST;

      if (field === 'email') {
        message = 'Email already taken.';
      } else {
        message = `Duplicate value for field: ${field}`;
      }

      fieldErrors = {
        [field]: ['already exists'],
      };
    }

    // -------------------------------------
    // 🔥 Prisma P2025 – Record Not Found
    // -------------------------------------
    if (exception.code === 'P2025') {
      message = 'Record not found.';
      statusCode = HttpStatus.NOT_FOUND;
    }

    // ---------------------------
    // GRAPHQL CONTEXT (Mercurius)
    // ---------------------------
    const gqlHost = GqlArgumentsHost.create(host);

    if (gqlHost.getInfo()) {
      return {
        message,
        extensions: {
          code: `PRISMA_${exception.code}`,
          statusCode,
          ...(fieldErrors ? { fieldErrors } : {}),
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
      ...(fieldErrors ? { fieldErrors } : {}),
    });
  }
}
