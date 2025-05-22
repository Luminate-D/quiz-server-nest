import { Module } from '@nestjs/common';
import { QuizGateway } from './quiz.gateway';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { QuizManagerService } from './quiz.manager';
import { LoggerModule } from '../logger/logger.module';
import { QuizController } from './quiz.controller';

@Module({
  imports: [LoggerModule, TypeOrmModule.forFeature([User])],
  providers: [UserService, QuizManagerService, QuizGateway],
  controllers: [QuizController],
})
export class QuizModule {}
