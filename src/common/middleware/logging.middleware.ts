import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    this.logger.log(`Incoming request: ${method} ${originalUrl}`);

    const originalEnd = res.end.bind(res);

    (res.end as any) = (...args: any[]) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const { statusCode } = res;

      const logMessage = `${method} ${originalUrl} - Status: ${statusCode} - Duration: ${duration}ms`;
      
      if (statusCode >= 400) {
        this.logger.error(logMessage);
      } else {
        this.logger.log(logMessage);
      }

      return originalEnd(...args);
    };

    next();
  }
}