import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, user: User): Promise<Workspace> {
    const workspace = this.workspaceRepository.create({
      ...createWorkspaceDto,
      owner: user,
    });
    return this.workspaceRepository.save(workspace);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Workspace[]; total: number }> {
    const skip = (page - 1) * limit;
    const [workspaces, total] = await this.workspaceRepository.findAndCount({
      take: limit,
      skip,
      relations: ['users', 'tasks', 'owner'],
    });
    return { data: workspaces, total };
  }

  async findOne(id: number): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: ['users', 'tasks', 'owner'],
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }

    return workspace;
  }

  async update(id: number, user: User, updateWorkspaceDto: UpdateWorkspaceDto): Promise<Workspace> {
    const workspace = await this.findOne(id);

    if (workspace.owner.id !== user.id) {
      throw new BadRequestException('Only workspace owner can update it');
    }

    Object.assign(workspace, updateWorkspaceDto);
    return this.workspaceRepository.save(workspace);
  }

  async remove(id: number, user: User): Promise<void> {
    const workspace = await this.findOne(id);

    if (workspace.owner.id !== user.id) {
      throw new BadRequestException('Only workspace owner can delete it');
    }

    await this.workspaceRepository.remove(workspace);
  }
}
