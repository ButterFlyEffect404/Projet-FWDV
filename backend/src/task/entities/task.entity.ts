import { User } from "src/user/entities/user.entity";
import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' })
  status: string;

  @Column({ type: 'enum', enum: ['LOW', 'MEDIUM', 'HIGH'] })
  priority: string;

  @ManyToOne(() => User)
  assignedTo: User;

  @ManyToOne(() => User)
  createdBy: User;

  @Column()
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
