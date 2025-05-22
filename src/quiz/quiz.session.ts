import { Socket } from 'socket.io';
import { delay } from 'bluebird';
import { QuizModel } from './models/quiz.model';
import { Participant } from './models/participant.model';
import { DateTime } from 'luxon';
import { LoggerService } from '@nestjs/common';
import { AppLoggerService } from '../logger/logger.service';

export enum QuizState {
  Appointed,
  Starting,
  Running,
  Ended,
}

export class QuizSession {
  public id: number;
  public readonly quiz: QuizModel;
  private readonly logger: LoggerService;
  // login -> Participant
  private participants: Map<string, Participant> = new Map();
  private currentValidAnswerIndex: number;

  private leaderboard: Participant[];

  public constructor(id: number, quiz: QuizModel) {
    this.logger = new AppLoggerService(`QuizSession#${id}`);
    this.id = id;
    this.quiz = quiz;
    this.leaderboard = [];
    this._state = QuizState.Appointed;
  }

  private _state: QuizState;

  public get state() {
    return this._state;
  }

  public get membersCount() {
    return this.participants.size;
  }

  public async start() {
    this.logger.log(`Starting quiz '${this.quiz.name}'`);
    this.logger.log(`  - Wait time: ${this.quiz.startingWaitTimeInSeconds}`);
    this.logger.log(
      `  - Time per question: ${this.quiz.timePerQuestionInSeconds}`,
    );
    this.logger.log(`  - Questions: ${this.quiz.questions.length}`);

    this.setState(QuizState.Starting);
    await delay(this.quiz.startingWaitTimeInSeconds * 1000);

    this.logger.log(`Starting now!`);

    this.setState(QuizState.Running);
    for (const question of this.quiz.questions) {
      this.currentValidAnswerIndex = question.correctAnswerIndex;

      for (const participant of this.participants.values()) {
        participant.answered = false;
        participant.socket.emit('score', participant.score);
        participant.socket.emit('question', {
          text: question.text,
          answers: question.answers,
        });
      }

      await delay(this.quiz.timePerQuestionInSeconds * 1000);
    }

    this.currentValidAnswerIndex = -1;
    this.setState(QuizState.Ended);

    this.leaderboard = this.getLeaderboard();

    this.quiz.rewards.forEach((reward, index) => {
      const participant = this.leaderboard[index];
      if (participant) {
        participant.reward = reward;
        participant.socket.emit('reward', { reward });
      }
    });

    this.broadcast(
      'leaderboard',
      this.leaderboard.map((x) => ({
        name: x.socket.data.user.login,
        score: x.score,
      })),
    );
  }

  public answer(socket: Socket, index: number) {
    console.log(`Answer #${index}, correct: ${this.currentValidAnswerIndex}`);
    if (
      this._state != QuizState.Running ||
      index != this.currentValidAnswerIndex
    ) {
      return;
    }

    const participant = this.participants.get(socket.data.user.login);
    if (!participant || participant.answered) {
      return;
    }

    const diff = participant.lastAnswerAt.diffNow('milliseconds');
    console.log('Diff:', diff.milliseconds, diff);

    // TODO: map diff to score (50-150)
    participant.score += 100;
    participant.answered = true;
    participant.lastAnswerAt = DateTime.now();
  }

  public join(socket: Socket) {
    if (this._state == QuizState.Ended) {
      return;
    }

    const oldParticipant = this.participants.get(socket.data.user.login);
    if (oldParticipant) {
      oldParticipant.socket.disconnect(true);
      oldParticipant.socket = socket;
    }

    socket.data.quizId = this.id;
    socket.emit('quizInfo', {
      quizId: this.id,
      name: this.quiz.name,
      beginAt: this.quiz.beginAt,
      startingWaitTimeInSeconds: this.quiz.startingWaitTimeInSeconds,
      timePerQuestionInSeconds: this.quiz.timePerQuestionInSeconds,
    });

    socket.emit('quizState', this.state);

    if (!oldParticipant)
      this.participants.set(socket.data.user.login, new Participant(socket));
  }

  public toDTO() {
    return {
      id: this.id,
      name: this.quiz.name,
      beginAt: this.quiz.beginAt,
      questions: this.quiz.questions.length,
      state: this.state,
      members: this.membersCount,
    };
  }

  private broadcast(event: string, data: any) {
    for (const participant of this.participants.values()) {
      participant.socket.emit(event, data);
    }
  }

  private setState(newState: QuizState) {
    this._state = newState;
    this.broadcast('quizState', newState);
  }

  private getLeaderboard() {
    const participants = Array.from(this.participants.values());
    participants.sort((a, b) => b.score - a.score);

    return participants;
  }
}
