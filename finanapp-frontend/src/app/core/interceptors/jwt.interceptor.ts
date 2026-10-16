import {HttpInterceptorFn} from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/auth/') || (req.url.includes('/api/usuario') && req.method === 'POST')) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  if (token != null){
    const cloned = req.clone({setHeaders: {Authorization : `Bearer ${token}`}});
    return next(cloned)
  }
  return next(req);
}
