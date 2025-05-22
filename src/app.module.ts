import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { QuizModule } from './quiz/quiz.module';
import { LoggerModule } from './logger/logger.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'quiz.db',
      entities: [User],
      synchronize: true,
    }),
    AuthModule,
    QuizModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
