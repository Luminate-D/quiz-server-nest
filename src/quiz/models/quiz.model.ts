import { DateTime } from 'luxon';

export class QuizModel {
  name: string;
  beginAt: DateTime<true>;
  questions: { text: string; answers: string[]; correctAnswerIndex: number }[];
  rewards: string[];

  startingWaitTimeInSeconds: number;
  timePerQuestionInSeconds: number;
}
