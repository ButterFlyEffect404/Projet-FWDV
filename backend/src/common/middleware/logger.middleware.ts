import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(
      `Incoming Request: ${method} ${originalUrl} - ${ip} - ${userAgent}`,
    );

    // Log response when finished
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const message = `Completed: ${method} ${originalUrl} ${statusCode} - ${duration}ms`;

      if (statusCode >= 500) {
        this.logger.error(message);
      } else if (statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}