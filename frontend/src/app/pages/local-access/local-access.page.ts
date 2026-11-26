import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '~/app/services/auth/auth.service';
import { LocalRole } from '~/app/local-api/local-api.service';

@Component({
  selector: 'app-local-access',
  standalone: true,
  imports: [FormsModule, IonicModule, RouterLink],
  templateUrl: './local-access.page.html',
  styleUrls: ['./local-access.page.scss'],
})
export class LocalAccessPage {
  readonly role: LocalRole;
  mode: 'register' | 'login';
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  tutorCode = '';
  working = false;
  error = '';

  constructor(route: ActivatedRoute, private auth: AuthService, private router: Router) {
    this.role = route.snapshot.queryParamMap.get('role') === 'tutor' ? 'tutor' : 'student';
    this.mode = route.snapshot.queryParamMap.get('mode') === 'login' ? 'login' : 'register';
  }

  async submit(): Promise<void> {
    if (this.working) return;
    this.error = '';
    if (this.mode === 'register' && this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    this.working = true;
    try {
      if (this.mode === 'register') {
        await this.auth.registerLocal({ name: this.name, email: this.email, password: this.password, role: this.role, tutorCode: this.tutorCode });
      } else {
        await this.auth.loginLocal(this.email, this.password, this.role);
      }
      this.password = '';
      this.confirmPassword = '';
      await this.router.navigateByUrl('/profile', { replaceUrl: true });
    } catch (error) {
      console.error('No se pudo acceder a la cuenta local:', error);
      this.error = error instanceof Error && /^(Escribe|Ya existe|No se encontró|Correo,|La cuenta)/.test(error.message)
        ? error.message : 'No se pudo acceder al almacenamiento local. Inténtalo de nuevo.';
    } finally {
      this.working = false;
    }
  }

  switchMode(): void {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.password = '';
    this.confirmPassword = '';
    this.error = '';
  }
}
