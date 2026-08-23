import { Component, computed, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);

  protected displayName = computed(() => this.auth.currentUser()?.username ?? '');

  constructor() {
    // בכל טעינת אפליקציה שבה כבר יש טוקן שמור — נטען את פרטי המשתמש הנוכחי.
    effect(() => {
      if (this.auth.isLoggedIn() && !this.auth.currentUser()) {
        this.auth.loadCurrentUser().subscribe();
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
