import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Task } from './task/entities/task.entity';
import { User } from './user/entities/user.entity';
import { SeedModule } from './seed/seed.module';
import { LoggerMiddleware } from './common/middleware/logger/logger.middleware';

@Module({
  imports: [ 
    ConfigModule.forRoot({
      isGlobal: true, // Make config available globally
    }),
    TypeOrmModule.forRoot({
      type: 'mysql', 
      host: process.env.DB_HOST, 
      port: Number(process.env.DB_PORT), 
      username: process.env.DB_USER, 
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_NAME,
      entities: [Task, User],
      synchronize: true, 
      autoLoadEntities: true,
      
    }),
    UserModule, 
    AuthModule,
    TaskModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}