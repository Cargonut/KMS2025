import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    // Prüfen, ob die Exception eine ValidationPipe-Exception ist
    const response: any = exception.getResponse();
    const isValidationError = Array.isArray(response?.message);

    if (!isValidationError) {
      // Wenn KEIN ValidationError: normal weiterwerfen → Prisma Errors gehen durch!
      throw exception;
    }

    // GraphQL-Fehlerformatierung
    const graphQLError = {
      message: 'Validation failed',
      extensions: {
        statusCode: 400,
        errors: response.message,
      },
    };

    return graphQLError;
  }
}
