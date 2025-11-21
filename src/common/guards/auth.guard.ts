import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext,): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    // Validate toke for the exam i'm using '123'
    if (token !== '123') {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
}