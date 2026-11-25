import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '~/app/services/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class HomePage {
  constructor(private authService: AuthService, private router: Router) {}

  async logout() {
    await this.authService.logout();
    if (this.authService.isNative) await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
