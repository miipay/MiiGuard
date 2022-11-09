import { createHmac } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilterOperator, PaginateQuery, paginate, Paginated } from 'nestjs-paginate';
import { User, SessionToken } from './entities';
import { CreateUserDto } from './users.dto';
import { MAXIMUM_FAILURE_COUNT, LOCK_DURATION } from './constants';
import { LoginError, LoginErrorType } from './users.error';
import { hashPassword, verifyPassword } from './utils';

type CheckTokenType = 'accessTokenHash' | 'refreshTokenHash';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(SessionToken) private sessionTokenRepository: Repository<SessionToken>,
    private configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    const sha512 = createHmac('sha512', this.configService.get('DB_HMAC_SECRET'));
    return sha512.update(token).digest('hex');
  }

  private async checkToken(username: string, token: string, type: CheckTokenType) {
    return !!(await this.sessionTokenRepository.findOneBy({ username, [type]: this.hashToken(token) }));
  }

  async verifyAccessToken(username: string, token: string): Promise<boolean> {
    return await this.checkToken(username, token, 'accessTokenHash');
  }

  async verifyRefreshToken(username: string, token: string): Promise<boolean> {
    return await this.checkToken(username, token, 'refreshTokenHash');
  }

  async updateTokens(username: string, accessToken: string, refreshToken: string): Promise<void> {
    await this.sessionTokenRepository.upsert(
      {
        username,
        accessTokenHash: this.hashToken(accessToken),
        refreshTokenHash: this.hashToken(refreshToken),
      },
      ['username'],
    );
  }

  async logout(username: string) {
    await this.sessionTokenRepository.delete({ username });
  }

  async createUser(userDto: CreateUserDto): Promise<User> {
    const { password, ...userRest } = userDto;
    const user = this.userRepository.create(userRest);
    const hashResult = await hashPassword(password);
    user.password = hashResult.passwordHash;
    user.hashAlgorithm = hashResult.algorithm;
    return await this.userRepository.save(user);
  }

  async verifyLogin(username: string, password: string): Promise<boolean> {
    const user = await this.userRepository
      .createQueryBuilder()
      .select(['user.username', 'user.locked', 'user.lockedUntil', 'user.password', 'user.failedCount'])
      .from(User, 'user')
      .where({ username })
      .getOne();
    if (!user) {
      throw new LoginError(LoginErrorType.userInexistent);
    }
    if (user.locked || user.lockedUntil.getTime() > new Date().getTime()) {
      throw new LoginError(LoginErrorType.userLocked);
    }
    const matched = await verifyPassword(user.password, password);
    if (matched) {
      user.failedCount > 0 && (await this.userRepository.update({ username }, { failedCount: 0 }));
      return true;
    }
    const updateResult = await this.userRepository.increment({ username }, 'failedCount', 1);
    if (user.failedCount + (updateResult.affected || 0) >= MAXIMUM_FAILURE_COUNT) {
      await this.userRepository.update({ username }, { lockedUntil: new Date(new Date().getTime() + LOCK_DURATION) });
    }
    throw new LoginError(LoginErrorType.wrongPassword);
  }

  async updateDisplayName(username: string, displayName: string): Promise<boolean> {
    const updateResult = await this.userRepository.update({ username }, { displayName });
    return updateResult.affected === 1;
  }

  async lockUser(username: string, locked: boolean): Promise<boolean> {
    const value = locked ? { locked } : { locked, lockedUntil: new Date() };
    const updateResult = await this.userRepository.update({ username }, value);
    return updateResult.affected === 1;
  }

  async findAll(query: PaginateQuery): Promise<Paginated<User>> {
    return paginate(query, this.userRepository, {
      sortableColumns: ['username', 'locked'],
      defaultSortBy: [['username', 'ASC']],
      filterableColumns: {
        locked: [FilterOperator.EQ],
      },
    });
  }

  async findOneByKey(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username });
  }

  async isActive(user: User): Promise<boolean> {
    if (!user) {
      return false;
    } else if (user.locked) {
      return false;
    } else if (user.lockedUntil.getTime() > new Date().getTime()) {
      return false;
    } else {
      return true;
    }
  }
}
