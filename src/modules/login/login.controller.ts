import { Controller, Get, Param } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}
  @Get('/me')
  public getMe(@Param('ticket') ticket: string) {
    return this.loginService.login(ticket);
  }
}
