import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { map, Observable } from 'rxjs';
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const startTime = Date.now();

    return next.handle().pipe(
      map((originalRes) => {
        const statusCode = response.statusCode;
        const duration = Date.now() - startTime;

        const data = originalRes?.data ?? {};
        const message = originalRes?.message ?? 'Request Successful';
        const meta = originalRes?.meta ?? {};

        return {
          success: true,
          data,
          message,
          meta: {
            status_code: statusCode,
            response_time: `${duration}ms`,
            timestamp: Date.now(),
            path: request.url,
            ...meta,
          },
        };
      }),
    );
  }
}
