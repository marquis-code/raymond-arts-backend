import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from "@nestjs/common"
import type { Observable } from "rxjs"
import { map } from "rxjs/operators"

export interface Response<T> {
  data: T
  meta?: any
  message?: string
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Check if data is already formatted
        if (data && data.data !== undefined) {
          return data
        }

        // Format the response
        return {
          data,
          meta: data.meta,
          message: data.message || "Success",
        }
      }),
    )
  }
}

