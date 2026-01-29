import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards  ,Request} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}
    @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createTaskDto: CreateTaskDto , @Request() req) {
   
    return this.taskService.create(createTaskDto , req.user);
  }
      @UseGuards(JwtAuthGuard)  

  @Get()
  findAll() {
    return this.taskService.findAll();
  }
      @UseGuards(JwtAuthGuard)

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(+id);
  }
//useless route
  //   @UseGuards(JwtAuthGuard)
  // @Get()
  // findByCriteria(@Body() filterDto: FilterTaskDto) {
  //   return this.taskService.findByCriteria(filterDto);
  // }
      @UseGuards(JwtAuthGuard)

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }
      @UseGuards(JwtAuthGuard)

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }
  //useless route
//     @UseGuards(JwtAuthGuard)
//   @Delete()
//   DeleteByCriteria(@Body() filterDto: FilterTaskDto){
//     return this.taskService.deleteByCriteria(filterDto);
//   }

// }
}