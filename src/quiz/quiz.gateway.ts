import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from './user.service';
import { QuizManagerService } from './quiz.manager';
import { Inject, LoggerService } from '@nestjs/common';

@WebSocketGateway({ namespace: '/quiz', cors: { origin: '*' } })
export class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(
    @Inject('LoggerService') private logger: LoggerService,
    private userService: UserService,
    private quizManager: QuizManagerService,
  ) {
    quizManager.on('add', (session) => {
      this.server.to('listQuizzes').emit('addQuiz', session.toDTO());
    });

    quizManager.on('remove', (id) => {
      this.server.to('listQuizzes').emit('removeQuiz', { id });
    });
  }

  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth.token;
    if (!token) {
      this.logger.log(
        `Unauthenticated connection ${socket.id} (No token ?sus)`,
      );
      socket.disconnect(true);
      return;
    }

    const user = await this.userService.getUserByToken(token);
    if (!user) {
      this.logger.log(
        `Unauthenticated connection ${socket.id} (Invalid token: '${token}')`,
      );
      socket.emit('unauthenticated');
      socket.disconnect(true);
      return;
    }

    this.logger.log(`Connection ${socket.id} -> ${user.login}`);
    socket.data.user = user;

    socket.emit('identify', user);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Disconnected ${socket.id}`);
  }

  @SubscribeMessage('listQuizzes')
  async listQuizzes(@ConnectedSocket() socket: Socket) {
    if (!socket.data.user) return socket.disconnect(true);

    socket.join('listQuizzes');
    for (let dto of this.quizManager.list()) {
      socket.emit('addQuiz', dto);
    }
  }

  @SubscribeMessage('unlistQuizzes')
  async unlist(@ConnectedSocket() socket: Socket) {
    socket.leave('listQuizzes');
  }

  @SubscribeMessage('joinQuiz')
  async joinQuiz(
    @ConnectedSocket() socket: Socket,
    @MessageBody('quizId') id: number,
  ) {
    if (!socket.data.user) return socket.disconnect(true);

    const quiz = this.quizManager.getQuiz(id);
    if (!quiz) {
      socket.emit('error', { error: 'No quiz with given id' });
      return;
    }

    quiz.join(socket);
  }

  @SubscribeMessage('answer')
  async answer(
    @ConnectedSocket() socket: Socket,
    @MessageBody('index') index: number,
  ) {
    const quiz = this.quizManager.getQuiz(socket.data.quizId);
    if (!quiz) {
      // WTF
      return;
    }

    quiz.answer(socket, index);
  }
}
