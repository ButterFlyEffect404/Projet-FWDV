import { Component, computed, Signal } from '@angular/core';
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

  constructor(public authService: Auth) {
    this.currentUser = this.authService.currentUser;
    this.isAuthenticated = computed(() => !!this.currentUser());
    this.userDisplayName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });
  }

  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}