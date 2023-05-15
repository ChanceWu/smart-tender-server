import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class LoginService {
  constructor(private readonly httpService: HttpService) {}
  login(ticket: string) {
    return this.httpService.get(
      `http://10.30.5.248:8080/inter-api/auth/v1/third/authorize?tickte=${ticket}`,
    );
  }
}
