import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST') as string,
          password: config.get<string>('REDIS_PASSWORD') as string,
          port: config.get<number>('REDIS_PORT') as number,
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'uploader',
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
