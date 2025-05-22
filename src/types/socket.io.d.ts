import { User } from '../entities/user.entity';

declare module 'socket.io' {
  interface Socket {
    data: {
      user?: User;
      quizId?: number;
      [key: string]: any;
    };
  }
}
