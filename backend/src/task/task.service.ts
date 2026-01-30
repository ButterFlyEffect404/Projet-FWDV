import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { BaseEntity, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity'
import { Task } from './entities/task.entity';
import { GenericCrud } from 'src/generic/generic_crud.service';
import { FilterTaskDto } from './dto/filter-task.dto';
import { Workspace } from 'src/workspace/entities/workspace.entity';

@Injectable()
export class TaskService{   

  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const workspaceId = createTaskDto.workspaceId;
    const workspace = await this.workspaceRepo.findOne({ where: { id: workspaceId } });
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${workspaceId} not found`);
    }

    let assignedTo: User | undefined;
    if (createTaskDto.assignedToId) {
      const assignee = await this.userRepo.findOne({ where: { id: createTaskDto.assignedToId } });
      if (!assignee) {
        throw new NotFoundException(`User with ID ${createTaskDto.assignedToId} not found`);
      }
      assignedTo = assignee;
    }

    const { assignedToId, workspaceId: _wid, ...rest } = createTaskDto;
    const task = this.taskRepo.create({
      ...rest,
      workspace,
      createdBy: user,
      ...(assignedTo ? { assignedTo } : {}),
    });
    return await this.taskRepo.save(task);
  }
  async findAll(): Promise<Task[]> {
    return await this.taskRepo.find({
      relations: ['assignedTo', 'createdBy', 'workspace'],
    });
  } 
    async findOne(id: number): Promise<Task> { 
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy', 'workspace'],
    }); 
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }       
    return task;
  } 
  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    const { assignedToId, ...rest } = updateTaskDto as UpdateTaskDto & { assignedToId?: number };
    Object.assign(task, rest);
    if (assignedToId !== undefined) {
      if (assignedToId == null) {
        task.assignedTo = null as any;
      } else {
        const user = await this.userRepo.findOne({ where: { id: assignedToId } });
        if (!user) throw new NotFoundException(`User with ID ${assignedToId} not found`);
        task.assignedTo = user;
      }
    }
    return await this.taskRepo.save(task);
  }
    async remove(id: number): Promise<{ count: number }> {
      const deleteResult = await this.taskRepo.softDelete(id);
        if (!deleteResult.affected) {   
        throw new NotFoundException(`Task with ID ${id} not found`);
        }
        return { count: deleteResult.affected };
    }
    
//         assignedToId, 
//         createdById,
//         search, 
//         pageSize , 
//         pageNumber 
//     } = filterDto;


//     let skip = 0;
//     if (pageSize && pageNumber)
//       skip = (pageNumber - 1) * pageSize;

//     // Start Query Builder
//     const query = this.taskRepository.createQueryBuilder('task')
//         .leftJoinAndSelect('task.assignedTo', 'assignedTo')
//         .leftJoinAndSelect('task.createdBy', 'createdBy');

//     // 1. Exact Match Filters (Inherited from CreateTaskDto via PartialType)
//     if (status) {
//         query.andWhere('task.status = :status', { status });
//     }

//     if (priority) {
//         query.andWhere('task.priority = :priority', { priority });
//     }

//     // 2. Relation Filters (Using IDs)
//     if (assignedToId) {
//         query.andWhere('assignedTo.id = :assignedToId', { assignedToId });
//     }

//     if (createdById) {
//         query.andWhere('createdBy.id = :createdById', { createdById });
//     }

//     // 3. Text Search (Matches title OR description)
//     if (search) {
//         query.andWhere(
//             '(task.title ILIKE :search OR task.description ILIKE :search)',
//             { search: `%${search}%` }
//         );
//     }

//     // 4. Pagination & Execution
//     if (skip)
//     query.skip(skip)
//          .take(pageSize)
    
//     query.orderBy('task.createdAt', 'DESC');

//     const [data, total] = await query.getManyAndCount();

   

//     if (!pageSize)  pageSize = total;
//     if (!pageNumber) pageNumber = 1;

//     return {
//         data,
//         meta: {
//             totalItems: total,
//             itemCount: data.length,
//             itemsPerPage: pageSize,
//             totalPages: Math.ceil(total / pageSize),
//             currentPage: pageNumber,
//         }
//     };
// }

// async deleteByCriteria(filterDto: FilterTaskDto) {
//     // 1. Reuse your find logic to get the tasks matching the criteria
//     // We remove the limit/pagination to ensure we find ALL matching tasks
//     const { data } = await this.findByCriteria({
//         ...filterDto,
//         pageSize: 1000 // Increase limit to catch all, or handle in a loop
//     });

//     if (data.length === 0) {
//         throw new NotFoundException('No tasks found matching the criteria');
//     }

//     // 2. Extract the IDs
//     const idsToDelete = data.map(task => task.id);

//     // 3. Perform a bulk soft delete
//     const result = await this.taskRepository.softDelete(idsToDelete);

//     return {
//         message: `${result.affected} tasks deleted successfully`,
//         affectedCount: result.affected
//     };
// }
 
  

}
