import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { RegisterRequest } from '../../models/user.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  userData: RegisterRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  };

  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: Auth,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    // Validation
    if (!this.userData.email || !this.userData.password || 
        !this.userData.firstName || !this.userData.lastName) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.userData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.userData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
  this.errorMessage = '';

  this.authService.register(this.userData).subscribe({
    next: () => {
      this.isLoading = false; // Reset after success
      this.router.navigate(['/tasks']);
    },
    error: (error) => {
      this.isLoading = false;
      this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      this.cdRef.detectChanges(); // 👈 Explicitly force view update
    }
  });
  }
}