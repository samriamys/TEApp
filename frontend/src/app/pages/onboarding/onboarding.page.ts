import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '~/app/services/auth/auth.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [IonicModule, FormsModule],
  template: `
    <ion-content class="onboarding">
      <main>
        @if (auth.profile?.role === 'student') {
          <h1>Vincula tu tutor</h1>
          <p>Escribe el código de tu profesor para continuar.</p>
        } @else {
          <h1>Completa tu perfil</h1>
          <p>Intenta conectar de nuevo para completar tu perfil.</p>
        }
        <form (ngSubmit)="complete()">
          @if (auth.profile?.role === 'student') {
            <label for="tutorCode">Código tutor</label>
            <ion-input id="tutorCode" name="tutorCode" [(ngModel)]="tutorCode" fill="outline" required></ion-input>
          }
          @if (auth.profileError) { <p class="error" role="alert">{{auth.profileError}}</p> }
          <ion-button type="submit" expand="block" [disabled]="working || (auth.profile?.role === 'student' && !tutorCode.trim())">Continuar</ion-button>
        </form>
        <ion-button fill="clear" expand="block" (click)="signOut()">Cerrar sesión</ion-button>
      </main>
    </ion-content>
  `,
  styles: [`
    .onboarding { --background: #f7f9fc; }
    main { max-width: 420px; margin: 0 auto; padding: 72px 24px; }
    h1 { color: #7e8494; font-size: 24px; text-align: center; }
    label { display: block; margin-top: 36px; font-weight: 600; }
    ion-input { margin: 10px 0 20px; --background: #dae0f0; --border-radius: 50px; }
    ion-button { --border-radius: 50px; }
    .error { color: #a92318; }
  `],
})
export class OnboardingPage implements OnInit {
  tutorCode = '';
  working = false;
  constructor(public auth: AuthService, private router: Router) {}
  ngOnInit(): void { if (!this.auth.isAuthenticated) void this.router.navigate(['/login']); }
  async complete(): Promise<void> {
    if (this.working) return;
    this.working = true;
    try { if (await this.auth.ensureProfile(this.tutorCode)) await this.router.navigate(['/profile']); }
    finally { this.working = false; }
  }
  signOut(): void { void this.auth.logout(); }
}
