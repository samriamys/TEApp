import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

export type LoadState = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  selector: 'app-learning-status',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="status" aria-live="polite">
      @if (state === 'loading') { <p>Cargando contenido…</p> }
      @if (state === 'empty') {
        <h1>Contenido no disponible</h1>
        <p>No hay contenido para esta actividad.</p>
      }
      @if (state === 'error') {
        <h1>No se pudo cargar el contenido</h1>
        <p>Inténtalo de nuevo.</p>
        <button type="button" (click)="retry.emit()">Reintentar</button>
      }
      @if (state !== 'loading') { <a [routerLink]="backRoute">{{ backLabel }}</a> }
    </section>
  `,
  styles: [`
    .status { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 7%; color: #343946; text-align: center; font-family: Poppins, sans-serif; }
    h1, p { margin: 0; }
    h1 { font-size: 22px; }
    button, a { padding: 12px 24px; border: 0; border-radius: 999px; background: #7da2ff; color: #fff; font: 600 16px Poppins, sans-serif; text-decoration: none; cursor: pointer; }
    button:focus-visible, a:focus-visible { outline: 3px solid #426ad1; outline-offset: 3px; }
  `],
})
export class LearningStatusComponent {
  @Input({ required: true }) state: LoadState = 'loading';
  @Input() backRoute = '/lessons';
  @Input() backLabel = 'Volver a lecciones';
  @Output() retry = new EventEmitter<void>();
}
