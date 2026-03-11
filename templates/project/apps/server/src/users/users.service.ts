import { Injectable, NotFoundException, ConflictException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const exists = await this.userRepo.findOne({ where: { email: 'Admin' } });
    if (!exists) {
      const passwordHash = await bcrypt.hash('test1234', 10);
      await this.userRepo.save({
        email: 'Admin',
        passwordHash,
        displayName: '관리자',
        role: UserRole.ADMIN,
      });
      console.log('[Seed] Admin 계정이 생성되었습니다. (ID: Admin / PW: test1234)');
    }
  }

  findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async register(email: string, password: string, displayName: string): Promise<User> {
    const exists = await this.findByEmail(email);
    if (exists) throw new ConflictException('이미 사용 중인 이메일입니다.');
    const passwordHash = await bcrypt.hash(password, 10);
    return this.userRepo.save({ email, passwordHash, displayName, role: UserRole.USER });
  }

  async updateProfile(id: string, data: Partial<Pick<User, 'displayName' | 'avatar'>>) {
    await this.userRepo.update(id, data);
    const user = await this.findById(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  // Admin only
  findAll(): Promise<User[]> {
    return this.userRepo.find({ order: { createdAt: 'DESC' } });
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    await this.userRepo.update(id, { isActive });
    const user = await this.findById(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepo.delete(id);
  }
}
