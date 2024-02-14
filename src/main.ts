import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger'
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout/timeout.interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new HttpExceptionFilter())

  // app.useGlobalInterceptors(new TimeoutInterceptor())

  const options = new DocumentBuilder()
    .setTitle('Task management')
    .setDescription('Task management app')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('/api', app, document)
  await app.listen(3000); 
}
bootstrap();
