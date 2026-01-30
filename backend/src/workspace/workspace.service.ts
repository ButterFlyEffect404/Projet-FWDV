import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { User } from 'src/user/entities/user.entity';
import { Task } from 'src/task/entities/task.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, user: User): Promise<Workspace> {
    const { members, ...rest } = createWorkspaceDto;
    const workspace = this.workspaceRepository.create({
      ...rest,
      owner: user,
    });
    const saved = await this.workspaceRepository.save(workspace);
    if (members?.length) {
      const users = await this.userRepository.findBy({ id: In(members) });
      saved.users = users;
      await this.workspaceRepository.save(saved);
    }
    return this.findOne(saved.id);
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

  async getTasks(workspaceId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['assignedTo', 'createdBy', 'workspace'],
    });
  }

  async addMember(workspaceId: number, userId: number, currentUser: User): Promise<Workspace> {
    const workspace = await this.findOne(workspaceId);
    if (workspace.owner.id !== currentUser.id) {
      throw new BadRequestException('Only workspace owner can add members');
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    if (!workspace.users) workspace.users = [];
    if (workspace.users.some((u) => u.id === userId)) return this.findOne(workspaceId);
    workspace.users.push(user);
    await this.workspaceRepository.save(workspace);
    return this.findOne(workspaceId);
  }

  async removeMember(workspaceId: number, userId: number, currentUser: User): Promise<Workspace> {
    const workspace = await this.findOne(workspaceId);
    if (workspace.owner.id !== currentUser.id) {
      throw new BadRequestException('Only workspace owner can remove members');
    }
    workspace.users = workspace.users?.filter((u) => u.id !== userId) ?? [];
    await this.workspaceRepository.save(workspace);
    return this.findOne(workspaceId);
  }

  async update(id: number, user: User, updateWorkspaceDto: UpdateWorkspaceDto): Promise<Workspace> {
    const workspace = await this.findOne(id);

    if (workspace.owner.id !== user.id) {
      throw new BadRequestException('Only workspace owner can update it');
    }

    const { members, ...rest } = updateWorkspaceDto;
    Object.assign(workspace, rest);
    if (members !== undefined) {
      const users = await this.userRepository.findBy({ id: In(members) });
      workspace.users = users;
    }
    return this.workspaceRepository.save(workspace).then(() => this.findOne(id));
  }

  async remove(id: number, user: User): Promise<void> {
    const workspace = await this.findOne(id);

    if (workspace.owner.id !== user.id) {
      throw new BadRequestException('Only workspace owner can delete it');
    }

    await this.workspaceRepository.remove(workspace);
  }
}
