import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const response: any = exception.getResponse();

    // Nur Validation Errors behandeln
    if (!Array.isArray(response?.message)) {
      throw exception;
    }

    // Feld-Fehler extrahieren
    const fieldErrors: Record<string, string[]> = {};

    for (const err of response.message) {
      const field = err.split(' ')[0]; // nimmt das erste Wort als Feldname (z.B. "password")
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(err);
    }

    // 🔥 WICHTIG: ECHTEN GraphQLError werfen!
    throw new GraphQLError('Validation failed', {
      extensions: {
        code: 'BAD_USER_INPUT',
        statusCode: 400,
        fieldErrors,
      },
    });
  }
}
