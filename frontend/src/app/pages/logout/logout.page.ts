import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline, arrowBackOutline } from 'ionicons/icons';
import { AuthService } from '~/app/services/auth/auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class LogoutPage {
  working = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ logOutOutline, arrowBackOutline });
  }

  async logout(): Promise<void> {
    if (this.working) return;
    this.working = true;
    this.error = '';
    const local = this.authService.isLocal;
    try {
      await this.authService.logout();
      if (local || this.authService.isNative) await this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      console.error('No se pudo cerrar la sesión:', error);
      this.error = 'No se pudo cerrar la sesión. Inténtalo de nuevo.';
      this.working = false;
    }
  }

  async cancel(): Promise<void> {
    await this.router.navigateByUrl('/profile');
  }
}
