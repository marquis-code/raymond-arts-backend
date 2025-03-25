import { type ExceptionFilter, Catch, type ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common"
import type { Request, Response } from "express"

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const errorResponse = exception.getResponse()

    const error = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorResponse["message"] || exception.message,
      ...(process.env.NODE_ENV === "development" && { stack: exception.stack }),
    }

    this.logger.error(`${request.method} ${request.url}`, JSON.stringify(error), exception.stack)

    response.status(status).json(error)
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const error = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: exception.stack }),
    }

    this.logger.error(`${request.method} ${request.url}`, JSON.stringify(error), exception.stack)

    response.status(status).json(error)
  }
}

