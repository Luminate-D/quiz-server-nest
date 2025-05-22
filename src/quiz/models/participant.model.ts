import { Socket } from 'socket.io';
import { DateTime } from 'luxon';

export class Participant {
  socket: Socket;
  score: number;
  reward: string;

  answered: boolean;
  lastAnswerAt: DateTime;

  constructor(socket: Socket) {
    this.socket = socket;
    this.score = 0;
    this.answered = false;
    this.lastAnswerAt = DateTime.fromMillis(0);
  }
}
