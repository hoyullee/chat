import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 계정입니다. 관리자에게 문의하세요.');
    }

    const deviceId = dto.deviceId || uuidv4();
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepo.upsert(
      {
        userId: user.id,
        deviceId,
        tokenHash: await bcrypt.hash(refreshToken, 10),
        expiresAt,
      },
      ['userId', 'deviceId'],
    );

    return {
      accessToken,
      refreshToken,
      deviceId,
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    };
  }

  async logout(userId: string, deviceId: string) {
    await this.refreshTokenRepo.delete({ userId, deviceId });
    return { success: true };
  }

  async refresh(refreshToken: string, deviceId: string) {
    const stored = await this.refreshTokenRepo.findOne({ where: { deviceId } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
    if (!(await bcrypt.compare(refreshToken, stored.tokenHash))) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    const user = await this.usersService.findById(stored.userId);
    if (!user) throw new UnauthorizedException();

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    const newRefreshToken = uuidv4();
    stored.tokenHash = await bcrypt.hash(newRefreshToken, 10);
    stored.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepo.save(stored);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
