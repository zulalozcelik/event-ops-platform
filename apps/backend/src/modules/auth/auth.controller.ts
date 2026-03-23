import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply } from 'fastify';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

type AuthenticatedRequest = {
  user: {
    id: string;
  };
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Register',
    description:
      'Creates a new account, issues an access token, and stores it in the access_token httpOnly cookie. The token is not returned in the response body.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', example: 'Jane Doe' },
        email: { type: 'string', format: 'email', example: 'jane@example.com' },
        password: { type: 'string', example: 'secret123' },
        role: {
          type: 'string',
          enum: ['ATTENDEE', 'ORGANIZER'],
          example: 'ATTENDEE',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description:
      'User registered successfully. The JWT is set in the access_token cookie.',
  })
  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const result = await this.authService.register(body);

    this.setAuthCookie(res, result.accessToken);

    return {
      user: result.user,
    };
  }

  @ApiOperation({
    summary: 'Login',
    description:
      'Authenticates the user, returns the user profile, and stores the access token in the access_token httpOnly cookie. The token is not returned in the response body, so Swagger Authorize cannot auto-fill it from this response.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'jane@example.com' },
        password: { type: 'string', example: 'secret123' },
      },
    },
  })
  @ApiOkResponse({
    description:
      'Login successful. The JWT is set in the access_token cookie.',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const result = await this.authService.login(body);

    this.setAuthCookie(res, result.accessToken);

    return {
      user: result.user,
    };
  }

  @ApiOperation({
    summary: 'Logout',
    description:
      'Clears the access_token cookie from the current session. This endpoint stays public so the client can safely call it even when the cookie is already missing.',
  })
  @ApiOkResponse({ description: 'Logged out successfully.' })
  @Post('logout')
  logout(@Res({ passthrough: true }) res: FastifyReply) {
    res.clearCookie('access_token', {
      path: '/',
    });

    return {
      message: 'Logged out',
    };
  }

  @ApiBearerAuth('bearer')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Get current user',
    description:
      'Returns the authenticated user. In the real app this request is usually authorized by the access_token cookie. Swagger can also call it with a bearer token when you paste one manually into Authorize.',
  })
  @ApiOkResponse({ description: 'Current user returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req.user.id);
  }

  private setAuthCookie(res: FastifyReply, token: string) {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const isProduction = nodeEnv === 'production';

    res.setCookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
  }
}
