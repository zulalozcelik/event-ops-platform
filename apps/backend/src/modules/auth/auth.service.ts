import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@event-ops/shared';
import { UsersService } from '../users/users.service';
import { IUserRepository } from '../users/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../users/repositories/user.repository.tokens';
import { IAuthCredentialRepository } from './repositories/auth-credential.repository.interface';
import { AUTH_CREDENTIAL_REPOSITORY } from './repositories/auth-credential.repository.tokens';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Email } from '../users/value-objects/email.vo';
import { User } from '../users/entities/user.entity';

type AuthResponseUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

type AuthResponse = {
  accessToken: string;
  user: AuthResponseUser;
};

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AUTH_CREDENTIAL_REPOSITORY)
    private readonly authCredentialRepository: IAuthCredentialRepository,
  ) {}

  public async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = Email.create(dto.email).value;

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      name: dto.name.trim(),
      email,
      role: dto.role as UserRole,
    });

    await this.authCredentialRepository.create({
      userId: user.id,
      passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  public async login(dto: LoginDto): Promise<AuthResponse> {
    const email = Email.create(dto.email).value;

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordHash =
      await this.authCredentialRepository.findPasswordHashByUserId(user.id);

    if (!passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  public async me(userId: string): Promise<AuthResponseUser> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toAuthResponseUser(user);
  }

  private buildAuthResponse(user: User): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.toAuthResponseUser(user),
    };
  }

  private toAuthResponseUser(user: User): AuthResponseUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
