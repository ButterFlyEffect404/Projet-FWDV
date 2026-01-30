/** User reference as returned by backend in task.assignedTo / task.createdBy */
export interface TaskUserRef {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | string;
  /** Set by backend in response; use workspace?.id when workspaceId not present */
  workspaceId?: number;
  workspace?: { id: number };
  createdAt: Date | string;
  updatedAt: Date | string;
  assignedTo?: TaskUserRef | null;
  createdBy?: TaskUserRef | null;
}
