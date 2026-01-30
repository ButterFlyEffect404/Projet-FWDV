export interface Workspace {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  members: number[];
  createdAt: Date;
  updatedAt: Date;
}
