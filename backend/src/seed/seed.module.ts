import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Task } from '../task/entities/task.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
