import {
  Body,
  Controller,
  Inject,
  LoggerService,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthorizationGuard } from '../auth/auth.guard';
import { QuizDTO } from './dto/quiz.dto';
import { QuizModel } from './models/quiz.model';
import { toDateTime } from './dto/datetime/datetime.transformer';
import { QuizManagerService } from './quiz.manager';
import { QuizState } from './quiz.session';

@UseGuards(AuthorizationGuard)
@Controller('quiz')
export class QuizController {
  constructor(
    @Inject('LoggerService') private logger: LoggerService,
    private quizManager: QuizManagerService,
  ) {}

  @Post('create')
  async createQuiz(@Body() dto: QuizDTO) {
    const model = new QuizModel();

    model.name = dto.name;
    model.beginAt = toDateTime(dto.beginAt)!;
    model.questions = dto.questions;
    model.rewards = dto.rewards;
    model.startingWaitTimeInSeconds = dto.startingWaitTimeInSeconds;
    model.timePerQuestionInSeconds = dto.timePerQuestionInSeconds;

    const session = this.quizManager.addQuiz(model);
    return {
      sessionId: session.id,
      quiz: session.quiz,
    };
  }

  @Post(':id/start')
  async start(@Param('id') id: string) {
    const session = this.quizManager.getQuiz(parseInt(id));
    if (!session) throw new NotFoundException('Session not found');

    if (session.state !== QuizState.Appointed) {
      return { error: 'Session already been started' };
    }

    void session.start();

    return {
      id: session.id,
      quiz: session.quiz,
    };
  }
}
