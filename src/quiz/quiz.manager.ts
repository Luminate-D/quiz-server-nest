import { QuizSession, QuizState } from './quiz.session';
import { QuizModel } from './models/quiz.model';
import { AppLoggerService } from '../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { EventEmitter } from '../lib/eventemitter';

interface QuizManagerEvents {
  add: [session: QuizSession];
  remove: [id: number];

  [key: string]: any[];
}

@Injectable()
export class QuizManagerService extends EventEmitter<QuizManagerEvents> {
  private idCounter: number = 0;
  private quizzes: Map<number, QuizSession> = new Map();
  private logger = new AppLoggerService('QuizManagerService');

  public getQuiz(quizId: number): QuizSession | null {
    return this.quizzes.get(quizId) || null;
  }

  public addQuiz(quiz: QuizModel): QuizSession {
    this.logger.log(
      `Creating QuizSession (ID: ${this.idCounter}): ${quiz.name}`,
    );

    const session = new QuizSession(this.idCounter++, quiz);
    this.quizzes.set(session.id, session);

    this.emit('add', session);

    return session;
  }

  public removeQuiz(quizId: number): void {
    this.logger.log(`Deleting QuizSession (ID: ${quizId})`);
    this.quizzes.delete(quizId);
    this.emit('remove', quizId);
  }

  public list() {
    return Array.from(this.quizzes.values())
      // .filter((x) => x.state != QuizState.Ended)
      .map((x) => x.toDTO());
  }
}
