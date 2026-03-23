import { Inject, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { IUserRepository } from './repositories/user.repository.interface';
import { USER_REPOSITORY } from './repositories/user.repository.tokens';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  public async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
