export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date;
  workspaceId: number;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: any;
  createdBy?: any;
}
