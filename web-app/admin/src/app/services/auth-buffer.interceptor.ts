import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpRequestBufferService } from './http-request-buffer.service';

@Injectable()
export class AuthBufferInterceptor implements HttpInterceptor {
  constructor(private buffer: HttpRequestBufferService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return this.buffer.bufferRequest(req, next);
        }
        return throwError(() => err);
      })
    );
  }
}
