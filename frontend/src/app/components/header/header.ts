import { Component, computed, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  // Using computed signal for derived state
  currentUser: Signal<User | null>;
  isAuthenticated = computed(() => false)
  userDisplayName = computed(() => '');
  userInitials = computed(() => '');
  showUserDropdown = signal(false);

  constructor(public authService: Auth) {
    this.currentUser = this.authService.currentUser;
    this.isAuthenticated = computed(() => !!this.currentUser());
    this.userDisplayName = computed(() => {
      const user = this.currentUser();
      return user ? `${user.firstName} ${user.lastName}` : '';
    });
    this.userInitials = computed(() => {
      const user = this.currentUser();
      return user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : '';
    });
  }

  toggleUserDropdown(): void {
    this.showUserDropdown.set(!this.showUserDropdown());
  }

  closeDropdown(): void {
    this.showUserDropdown.set(false);
  }

  onLogout(): void {
    this.closeDropdown();
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}