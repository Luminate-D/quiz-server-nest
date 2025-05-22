import { Module } from '@nestjs/common';
import { AppLoggerService } from './logger.service';

@Module({
  providers: [
    {
      provide: 'LoggerService',
      useClass: AppLoggerService,
    },
  ],
  exports: ['LoggerService'],
})
export class LoggerModule {}
