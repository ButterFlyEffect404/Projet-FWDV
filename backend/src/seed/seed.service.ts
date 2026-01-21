import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Task } from '../task/entities/task.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async seed() {
    await this.seedUsers();
    await this.seedTasks();
    console.log('Database seeding completed successfully!');
  }

  private async seedUsers() {
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      console.log('Users already exist, skipping user seeding...');
      return;
    }

    const users = [
      {
        email: 'john.doe@example.com',
        password: 'hashed_password_123',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      },
      {
        email: 'jane.smith@example.com',
        password: 'hashed_password_456',
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: true,
      },
      {
        email: 'bob.johnson@example.com',
        password: 'hashed_password_789',
        firstName: 'Bob',
        lastName: 'Johnson',
        isActive: true,
      },
      {
        email: 'alice.williams@example.com',
        password: 'hashed_password_101',
        firstName: 'Alice',
        lastName: 'Williams',
        isActive: true,
      },
    ];

    for (const userData of users) {
      const user = this.userRepository.create(userData);
      await this.userRepository.save(user);
    }

    console.log(`✓ Successfully seeded ${users.length} users`);
  }

  private async seedTasks() {
    const taskCount = await this.taskRepository.count();
    if (taskCount > 0) {
      console.log('Tasks already exist, skipping task seeding...');
      return;
    }

    const users = await this.userRepository.find();
    if (users.length === 0) {
      console.log('No users found, cannot seed tasks');
      return;
    }

    const tasks = [
      {
        title: 'Setup project infrastructure',
        description: 'Configure NestJS, TypeORM, and database',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2026-01-25'),
        assignedTo: users[0],
        createdBy: users[0],
      },
      {
        title: 'Implement authentication',
        description: 'Add JWT authentication and authorization',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date('2026-01-30'),
        assignedTo: users[1],
        createdBy: users[0],
      },
      {
        title: 'Create API documentation',
        description: 'Document all REST API endpoints using Swagger',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2026-02-10'),
        assignedTo: users[2],
        createdBy: users[0],
      },
      {
        title: 'Write unit tests',
        description: 'Add comprehensive unit tests for services',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2026-02-15'),
        assignedTo: users[3],
        createdBy: users[1],
      },
      {
        title: 'Setup frontend Angular app',
        description: 'Initialize Angular project with routing',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2026-01-28'),
        assignedTo: users[1],
        createdBy: users[1],
      },
      {
        title: 'Database optimization',
        description: 'Add indexes and optimize queries',
        status: 'DONE',
        priority: 'LOW',
        dueDate: new Date('2026-01-15'),
        assignedTo: users[2],
        createdBy: users[2],
      },
      {
        title: 'Error handling middleware',
        description: 'Implement global error handling and logging',
        status: 'DONE',
        priority: 'MEDIUM',
        dueDate: new Date('2026-01-20'),
        assignedTo: users[0],
        createdBy: users[0],
      },
      {
        title: 'Integration tests',
        description: 'Write E2E tests for API endpoints',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2026-02-20'),
        assignedTo: users[3],
        createdBy: users[1],
      },
    ];

    for (const taskData of tasks) {
      const task = this.taskRepository.create(taskData);
      await this.taskRepository.save(task);
    }

    console.log(`✓ Successfully seeded ${tasks.length} tasks`);
  }
}
