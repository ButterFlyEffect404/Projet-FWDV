import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity'
import { Task } from './entities/task.entity';
import { GenericCrud } from 'src/generic/generic_crud.service';
import { FilterTaskDto } from './dto/filter-task.dto';

@Injectable()
export class TaskService extends GenericCrud<Task> {

  constructor(@InjectRepository(Task) private readonly taskRepository: Repository<Task>){
    super(taskRepository);
  }

  async findByCriteria(filterDto: FilterTaskDto) {
    let  { 
        status, 
        priority, 
        assignedToId, 
        createdById,
        search, 
        pageSize , 
        pageNumber 
    } = filterDto;


    let skip = 0;
    if (pageSize && pageNumber)
      skip = (pageNumber - 1) * pageSize;

    // Start Query Builder
    const query = this.taskRepository.createQueryBuilder('task')
        .leftJoinAndSelect('task.assignedTo', 'assignedTo')
        .leftJoinAndSelect('task.createdBy', 'createdBy');

    // 1. Exact Match Filters (Inherited from CreateTaskDto via PartialType)
    if (status) {
        query.andWhere('task.status = :status', { status });
    }

    if (priority) {
        query.andWhere('task.priority = :priority', { priority });
    }

    // 2. Relation Filters (Using IDs)
    if (assignedToId) {
        query.andWhere('assignedTo.id = :assignedToId', { assignedToId });
    }

    if (createdById) {
        query.andWhere('createdBy.id = :createdById', { createdById });
    }

    // 3. Text Search (Matches title OR description)
    if (search) {
        query.andWhere(
            '(task.title ILIKE :search OR task.description ILIKE :search)',
            { search: `%${search}%` }
        );
    }

    // 4. Pagination & Execution
    if (skip)
    query.skip(skip)
         .take(pageSize)
    
    query.orderBy('task.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();

   

    if (!pageSize)  pageSize = total;
    if (!pageNumber) pageNumber = 1;

    return {
        data,
        meta: {
            totalItems: total,
            itemCount: data.length,
            itemsPerPage: pageSize,
            totalPages: Math.ceil(total / pageSize),
            currentPage: pageNumber,
        }
    };
}

async deleteByCriteria(filterDto: FilterTaskDto) {
    // 1. Reuse your find logic to get the tasks matching the criteria
    // We remove the limit/pagination to ensure we find ALL matching tasks
    const { data } = await this.findByCriteria({
        ...filterDto,
        pageSize: 1000 // Increase limit to catch all, or handle in a loop
    });

    if (data.length === 0) {
        throw new NotFoundException('No tasks found matching the criteria');
    }

    // 2. Extract the IDs
    const idsToDelete = data.map(task => task.id);

    // 3. Perform a bulk soft delete
    const result = await this.taskRepository.softDelete(idsToDelete);

    return {
        message: `${result.affected} tasks deleted successfully`,
        affectedCount: result.affected
    };
}
 
  

}
