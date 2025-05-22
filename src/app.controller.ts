import { Controller, Get, Inject, LoggerService } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(@Inject('LoggerService') private logger: LoggerService) {}

  @Get()
  getHello(): string {
    this.logger.error('SOSAL');
    return 'sosal';
  }
}
