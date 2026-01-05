import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [UserModule, 
            TaskModule, 
            AuthModule,
            TypeOrmModule.forRoot(
              {
                type: 'mysql', 
                host: process.env.DB_HOST, 
                port: process.env.DB_PORT, 
                username: process.env.DB_USER, 
                password: process.env.DB_PASSWORD, 
                database: process.env.DB_NAME, entities: [],
                synchronize: true, 
              }
            )
          ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
