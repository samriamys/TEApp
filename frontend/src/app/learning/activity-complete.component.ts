import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, arrowForwardOutline, homeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-activity-complete',
  standalone: true,
  imports: [IonicModule, RouterLink],
  template: `
    <section class="completion">
      @if (kind === 'lesson') {
        <div class="trophy" role="img" aria-label="Trofeo de felicitación">🏆</div>
      }
      <h1>{{ kind === 'exam' ? '¡Examen terminado!' : '¡Felicidades!' }}</h1>
      @if (kind === 'lesson') { <h2>Completaste la lección de la letra {{ letter.toUpperCase() }}</h2> }
      @if (kind === 'exercise') { <h2>Completaste los ejercicios</h2> }
      @if (kind === 'exam') { <h2>Resultado: {{ score }} / {{ total }} puntos</h2> }
      <p>Has hecho un gran progreso. ¡Sigue así!</p>
      <nav class="actions" aria-label="Opciones de la actividad">
        <a [routerLink]="kind === 'lesson' ? '/lessons' : kind === 'exercise' ? '/exercise' : '/exam'"><ion-icon name="home-outline" aria-hidden="true"></ion-icon><span>{{ kind === 'lesson' ? 'Lecciones' : kind === 'exercise' ? 'Ejercicios' : 'Exámenes' }}</span></a>
        <button type="button" (click)="retry.emit()"><ion-icon name="arrow-back-outline" aria-hidden="true"></ion-icon><span>Repetir</span></button>
        <a [routerLink]="kind === 'lesson' ? ['/exercise', letter] : kind === 'exercise' ? ['/exam', letter] : ['/lessons']"><ion-icon name="arrow-forward-outline" aria-hidden="true"></ion-icon><span>{{ kind === 'lesson' ? 'Ejercicio' : kind === 'exercise' ? 'Examen' : 'Siguiente' }}</span></a>
      </nav>
    </section>
  `,
  styles: [`
    .completion { min-height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 7%; background: #f8f9fd; color: #202532; text-align: center; font-family: Poppins, sans-serif; }
    h1 { margin: 0 0 12px; font-size: clamp(26px, 4vw, 40px); }
    h2 { margin: 0; font-size: clamp(18px, 2.8vw, 26px); }
    p { margin: 16px 0 24px; }
    .trophy { font-size: clamp(72px, 12vw, 125px); animation: float 2.5s ease-in-out infinite; }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: clamp(12px, 3vw, 30px); width: 100%; }
    .actions a, .actions button { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-width: 90px; min-height: 75px; padding: 12px; border: 0; border-radius: 18px; background: #7da2ff; color: white; font: 600 14px Poppins, sans-serif; text-decoration: none; cursor: pointer; }
    ion-icon { font-size: 28px; }
    a:focus-visible, button:focus-visible { outline: 3px solid #426ad1; outline-offset: 3px; }
    @keyframes float { 50% { transform: translateY(-10px); } }
    @media (prefers-reduced-motion: reduce) { .trophy { animation: none; } }
  `],
})
export class ActivityCompleteComponent {
  @Input({ required: true }) kind: 'lesson' | 'exercise' | 'exam' = 'lesson';
  @Input() letter = 'a';
  @Input() score = 0;
  @Input() total = 0;
  @Output() retry = new EventEmitter<void>();

  constructor() { addIcons({ homeOutline, arrowBackOutline, arrowForwardOutline }); }
}
