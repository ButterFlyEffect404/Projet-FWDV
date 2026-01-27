import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
  ) {}

  async create(userId: string, createWorkspaceDto: CreateWorkspaceDto): Promise<Workspace> {
    const workspace = this.workspaceRepository.create({
      ...createWorkspaceDto,
      ownerId: userId,
    });
    return this.workspaceRepository.save(workspace);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Workspace[]; total: number }> {
    const skip = (page - 1) * limit;
    const [workspaces, total] = await this.workspaceRepository.findAndCount({
      take: limit,
      skip,
    });
    return { data: workspaces, total };
  }

  async findOne(id: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    return workspace;
  }

  async update(id: string, userId: string, updateWorkspaceDto: UpdateWorkspaceDto): Promise<Workspace> {
    const workspace = await this.findOne(id);

    if (workspace.ownerId !== userId) {
      throw new BadRequestException('Only workspace owner can update it');
    }

    Object.assign(workspace, updateWorkspaceDto);
    return this.workspaceRepository.save(workspace);
  }

  async remove(id: string, userId: string): Promise<void> {
    const workspace = await this.findOne(id);

    if (workspace.ownerId !== userId) {
      throw new BadRequestException('Only workspace owner can delete it');
    }

    await this.workspaceRepository.remove(workspace);
  }
}
