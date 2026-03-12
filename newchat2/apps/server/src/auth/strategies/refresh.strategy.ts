import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    });
  }

  async validate(payload: { sub: string }) {
    return { sub: payload.sub };
  }
}
