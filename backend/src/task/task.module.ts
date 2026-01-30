import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from './entities/task.entity';
import { Workspace } from '../workspace/entities/workspace.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Workspace, User])],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
