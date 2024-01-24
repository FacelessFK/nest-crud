import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtPayload } from 'src/users/strategies/accessToken.strategy';
import { RefreshJwtPayload } from 'src/users/strategies/refreshToken.strategy';

export const GetCurrentUser = createParamDecorator(
  (
    data: keyof JwtPayload | keyof RefreshJwtPayload,
    context: ExecutionContext,
  ) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
