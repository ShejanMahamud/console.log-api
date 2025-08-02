import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseException } from './common/response.exception';
import { ResponseInterceptor } from './common/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1/api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  });
  app.use(helmet());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ResponseException());
  const config = new DocumentBuilder()
    .setTitle('console.log')
    .setDescription('Forum for devs and tech enthusiasts')
    .setVersion('1.0.0')
    .setLicense(
      'Apache 2.0 License',
      'https://www.apache.org/licenses/LICENSE-2.0',
    )
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/api/docs', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
