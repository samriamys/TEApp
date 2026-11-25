import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '~/app/services/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class RegisterPage {
  name: string = '';
  email: string = '';
  password: string = '';
  phoneNumber: string = '';

  constructor(public router: Router, private authService: AuthService) {}

  register() {
    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      phoneNumber: this.phoneNumber,
      role: 'tutor',
    });
    this.router.navigate(['/profile']);
  }
}
