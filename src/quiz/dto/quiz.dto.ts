import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { QuestionDTO } from './question.dto';
import { IsLuxonDateTime } from './datetime/datetime.validator';
import { toDateTime } from './datetime/datetime.transformer';

export class QuizDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(({ value }) => toDateTime(value))
  @IsLuxonDateTime()
  @IsNotEmpty()
  beginAt: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionDTO)
  questions: { text: string; answers: string[]; correctAnswerIndex: number }[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  rewards: string[];

  @IsNumber()
  @IsNotEmpty()
  startingWaitTimeInSeconds: number;

  @IsNumber()
  @IsNotEmpty()
  timePerQuestionInSeconds: number;
}
