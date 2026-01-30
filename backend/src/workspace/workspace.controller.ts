import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

/** Response shape for workspace so frontend gets ownerId and members (number[]) */
export interface WorkspaceResponse {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  members: number[];
  createdAt: Date;
  updatedAt: Date;
}

@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createWorkspaceDto: CreateWorkspaceDto): Promise<WorkspaceResponse> {
    const workspace = await this.workspaceService.create(createWorkspaceDto, req.user);
    return this.toResponse(workspace);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: WorkspaceResponse[]; total: number }> {
    const result = await this.workspaceService.findAll(page, limit);
    return {
      data: result.data.map((w) => this.toResponse(w)),
      total: result.total,
    };
  }

  @Get(':id/tasks')
  async getWorkspaceTasks(@Param('id') id: string) {
    return this.workspaceService.getTasks(+id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WorkspaceResponse> {
    const workspace = await this.workspaceService.findOne(+id);
    return this.toResponse(workspace);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  async addMember(
    @Param('id') id: string,
    @Body() body: { userId: number },
    @Request() req,
  ): Promise<WorkspaceResponse> {
    const workspace = await this.workspaceService.addMember(+id, body.userId, req.user);
    return this.toResponse(workspace);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req,
  ): Promise<WorkspaceResponse> {
    const workspace = await this.workspaceService.removeMember(+id, +userId, req.user);
    return this.toResponse(workspace);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<WorkspaceResponse> {
    const workspace = await this.workspaceService.update(+id, req.user, updateWorkspaceDto);
    return this.toResponse(workspace);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    await this.workspaceService.remove(+id, req.user);
    return { message: 'Workspace deleted successfully' };
  }

  private toResponse(workspace: any): WorkspaceResponse {
    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description ?? null,
      ownerId: workspace.owner?.id ?? workspace.ownerId,
      members: workspace.users?.map((u: any) => u.id) ?? [],
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }
}
