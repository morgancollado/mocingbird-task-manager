// src/main.ts
import { bootstrapApplication }      from '@angular/platform-browser';
import { provideRouter }             from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';

import { App }                       from './app/app';
import { routes }                    from './app/app.routes';
import { AuthInterceptor }           from './app/interceptors/auth.interceptor';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),

    // 1) Register the HTTP runtime
    provideHttpClient(withInterceptorsFromDi()),

    // 2) Make sure Angular can create your interceptor
    AuthInterceptor,

    // 3) Tie the interceptor into the HTTP pipeline
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: AuthInterceptor,
      multi: true
    },
  ]
})
.catch(err => console.error(err));
