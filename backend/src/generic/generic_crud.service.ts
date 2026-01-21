import { NotFoundException } from "@nestjs/common";
import { ObjectLiteral, Repository, FindOptionsWhere, DeepPartial } from "typeorm";

// Ensure the entity always has an ID to satisfy TypeORM requirements
interface BaseEntity extends ObjectLiteral {
    id: any;
}

export abstract class GenericCrud<Entity extends BaseEntity> {
    
    constructor(private readonly repository: Repository<Entity>) { }

    // Use DeepPartial to allow NestJS DTOs to map correctly to the Entity
    async create(createDto: DeepPartial<Entity>): Promise<Entity> {
        const entity = this.repository.create(createDto);
        return await this.repository.save(entity);
    }

    async update(id: any, updateDto: DeepPartial<Entity>): Promise<Entity> {
        // Preload maps the DTO onto an existing entity if found
        const newEntity = await this.repository.preload({
            id: id,
            ...updateDto,
        } as any);

        if (!newEntity) throw new NotFoundException(`Entity with ID ${id} not found`);
        
        // Important: You must 'await' the save or return it
        return await this.repository.save(newEntity);
    }

    async findAll(): Promise<Entity[]> {
        return await this.repository.find();
    }

    async findOne(id: any): Promise<Entity> {
        // We use FindOptionsWhere to satisfy the Generic type requirement
        const entity = await this.repository.findOne({
            where: { id } as FindOptionsWhere<Entity>
        });
        
        if (!entity) throw new NotFoundException(`Entity with ID ${id} not found`);
        return entity;
    }

    async remove(id: number) {
        const deleteResult = await this.repository.softDelete(id);
        if (!deleteResult.affected) throw new NotFoundException(`Entity with ID ${id} not found`);
        return { count: deleteResult.affected };
    }
}