import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity'
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}
  //private readonly taskRepository: Repository<Task>
  create(createTaskDto: CreateTaskDto) {
    const res = this.taskRepository.save(createTaskDto)
    return res;
  }

  async findAll() {
    const tasks = await this.taskRepository.find(); 
    return tasks;
  }

async findOne(id: number) {
  // 1. Fetch the task from the database using the ID
  const task = await this.taskRepository.findOne({
    where: { id },
    relations: ['assignedTo'] // Optional: includes the user details
  });

}

  async update(id: number, updateTaskDto: UpdateTaskDto) {

    const newTask = await this.taskRepository.preload({id, ...updateTaskDto}) 
    if (!newTask) throw new NotFoundException('Element not found');
        this.taskRepository.save(newTask);
        return newTask;
  }

  async remove(id: number) {
     const deleteResult = await this.taskRepository.
        softDelete(id);
        if (!deleteResult.affected) throw new NotFoundException();
        return {count: deleteResult.affected };
  }
}
