import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ValidationError {
  field: string | null;
  message: string;
}

interface ErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class ResponseException implements ExceptionFilter {
  private readonly logger = new Logger(ResponseException.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const request: Request = ctx.getRequest<Request>();

    const status = this.getHttpStatus(exception);
    const errorResponse = this.getErrorResponse(exception);
    const { message, errors } = this.parseErrorMessage(
      exception,
      errorResponse,
    );

    // Log the error for debugging
    this.logError(exception, request, status);

    response.status(status).json({
      success: false,
      message,
      errors,
      meta: {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
    });
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorResponse(exception: unknown): ErrorResponse | string | null {
    if (exception instanceof HttpException) {
      return exception.getResponse();
    }
    return null;
  }

  private parseErrorMessage(
    exception: unknown,
    errorResponse: ErrorResponse | string | null,
  ): { message: string; errors?: ValidationError[] } {
    let message: string;
    let errors: ValidationError[] | undefined;

    if (typeof errorResponse === 'string') {
      message = errorResponse;
    } else if (errorResponse && typeof errorResponse === 'object') {
      const result = this.handleObjectErrorResponse(errorResponse);
      message = result.message;
      errors = result.errors;
    } else {
      message = this.getDefaultErrorMessage(exception);
    }

    return { message, errors };
  }

  private handleObjectErrorResponse(errorResponse: ErrorResponse): {
    message: string;
    errors?: ValidationError[];
  } {
    if ('message' in errorResponse && errorResponse.message) {
      const msg = errorResponse.message;

      if (Array.isArray(msg)) {
        return {
          message: 'Validation failed',
          errors: msg.map((m) => ({
            field: this.extractFieldFromMessage(m),
            message: m,
          })),
        };
      } else if (typeof msg === 'string') {
        return { message: msg };
      }
    }

    if ('error' in errorResponse && typeof errorResponse.error === 'string') {
      return { message: errorResponse.error };
    }

    return { message: 'Bad Request' };
  }

  private extractFieldFromMessage(message: string): string | null {
    // Try to extract field name from validation messages like "email must be a valid email"
    const fieldMatch = message.match(/^(\w+)\s+/);
    return fieldMatch ? fieldMatch[1] : null;
  }

  private getDefaultErrorMessage(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message || 'Internal Server Error';
    }
    return 'Internal Server Error';
  }

  private logError(exception: unknown, request: Request, status: number): void {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : undefined;

    const logMessage = `${request.method} ${request.url} - ${status} - ${message}`;

    if (status >= 500) {
      this.logger.error(logMessage, stack);
    } else {
      this.logger.warn(logMessage);
    }
  }
}
