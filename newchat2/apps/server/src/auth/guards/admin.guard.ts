import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../users/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    if (!userId) throw new ForbiddenException('관리자 권한이 필요합니다.');
    const user = await this.usersService.findById(userId);
    if (user?.role !== UserRole.ADMIN) throw new ForbiddenException('관리자 권한이 필요합니다.');
    return true;
  }
}
