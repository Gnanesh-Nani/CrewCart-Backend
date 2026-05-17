import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';

class SocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const clientPorts = [3000, 3001, 8080];
    const optionsWithCors: typeof options = {
      ...options,
      cors: {
        origin: clientPorts,
        credentials: true,
      },
    };
    return super.createIOServer(port, optionsWithCors);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new SocketIoAdapter(app));
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors
          .map(error => Object.values(error.constraints ?? {}))
          .flat();

        return new BadRequestException({
          error: true,
          message: messages[0] || 'Validation failed',
          data: {},
        });
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
