import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '~/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="floating">Email</ion-label>
        <ion-input [(ngModel)]="email"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="floating">Password</ion-label>
        <ion-input type="password" [(ngModel)]="password"></ion-input>
      </ion-item>
      <ion-button expand="block" (click)="login()">Login</ion-button>
      <ion-button
        expand="block"
        fill="clear"
        (click)="router.navigate(['/register'])"
        >Register</ion-button
      >
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, public router: Router) {}

  async login() {
    const success = this.authService.login(this.password, this.email);
    console.log(success);
    if (success) {
      this.router.navigate(['/profile']);
    }
  }
}
