import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace';
import { UserService } from '../../services/user';
import { User } from '../../models/user.model';
import { Workspace } from '../../models/workspace.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workspace-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './workspace-form.html',
  styleUrl: './workspace-form.css',
})
export class WorkspaceForm {
  isLoading = false;
  isEditing = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  workspace = signal<Workspace | null>(null);
  availableMembers = signal<User[]>([]);
  
  formData = signal({
    name: '',
    description: '',
    members: [] as string[]
  });

  constructor(
    private workspaceService: WorkspaceService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  initializeForm(): void {
    // Load available members first
    this.loadAvailableMembers();
    
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && id !== 'new') {
      // Edit mode
      this.isEditing = true;
      this.loadWorkspace(id);
    }
    // Create mode - formData is already initialized with empty values
  }

  loadAvailableMembers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.availableMembers.set(data);
      },
      error: (error: any) => {
        console.error('Error loading members:', error);
      }
    });
  }

  loadWorkspace(id: string): void {
    this.isLoading = true;
    this.workspaceService.getById(id).subscribe({
      next: (data) => {
        this.workspace.set(data);
        this.formData.set({
          name: data.name,
          description: data.description,
          members: data.members || []
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load workspace';
        console.error('Error loading workspace:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    const form = this.formData();
    
    // Validation
    if (!form.name || form.name.trim() === '') {
      this.errorMessage = 'Workspace name is required';
      return;
    }

    if (form.name.length < 3) {
      this.errorMessage = 'Workspace name must be at least 3 characters';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    if (this.isEditing) {
      this.updateWorkspace();
    } else {
      this.createWorkspace();
    }
  }

  createWorkspace(): void {
    // For new workspace, we need an ownerId
    // In a real app, this would come from the current user
    // For now, we'll use a placeholder
    const currentUserId = localStorage.getItem('current_user_id') || '1234';

    const newWorkspace = {
      name: this.formData().name,
      description: this.formData().description,
      members: this.formData().members,
      ownerId: currentUserId
    };

    this.workspaceService.create(newWorkspace).subscribe({
      next: (data) => {
        this.successMessage = 'Workspace created successfully!';
        setTimeout(() => {
          this.router.navigate(['/workspaces', data.id]);
        }, 1500);
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to create workspace';
        console.error('Error creating workspace:', error);
      }
    });
    this.isSubmitting = false;

  }

  updateWorkspace(): void {
    const ws = this.workspace();
    if (!ws) return;

    this.workspaceService.update(ws.id, this.formData()).subscribe({
      next: (data) => {
        this.successMessage = 'Workspace updated successfully!';
        setTimeout(() => {
          this.router.navigate(['/workspaces', ws.id]);
        }, 1500);
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update workspace';
        console.error('Error updating workspace:', error);
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    if (this.isEditing && this.workspace()) {
      this.router.navigate(['/workspaces', this.workspace()!.id]);
    } else {
      this.router.navigate(['/workspaces']);
    }
  }

  onFormDataChange(field: string, value: string | string[]): void {
    const current = this.formData();
    this.formData.set({
      ...current,
      [field]: value
    });
  }

  toggleMember(memberId: string): void {
    const current = this.formData().members;
    const updated = current.includes(memberId)
      ? current.filter(id => id !== memberId)
      : [...current, memberId];
    
    this.onFormDataChange('members', updated);
  }

  isMemberSelected(memberId: string): boolean {
    return this.formData().members.includes(memberId);
  }

  getMemberName(memberId: string): string {
    const member = this.availableMembers().find(m => m.id === parseInt(memberId, 10));
    return member ? `${member.firstName} ${member.lastName}` : memberId;
  }
}
