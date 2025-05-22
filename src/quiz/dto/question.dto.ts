import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class QuestionDTO {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  answers: string[];

  @IsNumber()
  @IsNotEmpty()
  correctAnswerIndex: number;
}
