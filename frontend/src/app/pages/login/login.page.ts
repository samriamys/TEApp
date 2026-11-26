import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '~/app/services/auth/auth.service';
import { Router } from '@angular/router';

type Role = 'student' | 'tutor';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class LoginPage {
  role: Role = 'student';
  error = false;
  constructor(public auth: AuthService, private router: Router) {}

  localAccess(mode: 'register' | 'login'): void {
    void this.router.navigate(['/local-access'], { queryParams: { role: this.role, mode } });
  }

  async continueRegistration() {
    this.error = false;
    try { await this.auth.register(this.role); } catch { this.error = true; }
  }

  async signIn() {
    this.error = false;
    try { await this.auth.login(this.role); } catch { this.error = true; }
  }
}
