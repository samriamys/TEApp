import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { GenericExerciseComponent } from '~/app/exercise/generic/generic-exercise.component';
import { ExerciseCompleteComponent } from './exercise-complete/exercise-complete.component';
import { PalabraService } from '~/app/services/palabra.service';

type Exercise = {
  incompleteText: string;
  completeText: string;
  imageUrl: string;
  audioUrl: string;
  letterOptions: string[];
};

@Component({
  selector: 'app-exercise',
  templateUrl: 'exercise.page.html',
  styleUrls: ['exercise.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    GenericExerciseComponent,
    ExerciseCompleteComponent,
  ],
})
export class ExercisePage {
  currentIndex = 0;
  allCompleted = false;
  exercises: Exercise[] = [];

  letraSeleccionada: string = 'a';

  constructor(
    private palabraService: PalabraService,
    private route: ActivatedRoute,
  ) {}

  ionViewWillEnter(): void {
    this.letraSeleccionada =
      this.route.snapshot.queryParamMap.get('letra')?.toLowerCase() || 'a';

    this.currentIndex = 0;
    this.allCompleted = false;
    this.exercises = [];

    this.cargarEjercicios();
  }

  cargarEjercicios() {
    forkJoin({
      dificultad1: this.palabraService.getPalabras(this.letraSeleccionada, 1),
      dificultad2: this.palabraService.getPalabras(this.letraSeleccionada, 2),
      dificultad3: this.palabraService.getPalabras(this.letraSeleccionada, 3),
    }).subscribe({
      next: (data) => {
        const nivel1 = this.obtenerAleatorias(data.dificultad1, 2);
        const nivel2 = this.obtenerAleatorias(data.dificultad2, 2);
        const nivel3 = this.obtenerAleatorias(data.dificultad3, 2);

        this.exercises = [...nivel1, ...nivel2, ...nivel3].map((item) => ({
          incompleteText: this.ocultarLetra(item.texto),
          completeText: item.texto,
          imageUrl: item.imagen,
          audioUrl: item.audio,
          letterOptions: this.mezclarVocales(),
        }));
      },
      error: (error) => {
        console.error('Error cargando ejercicios:', error);
      },
    });
  }

  obtenerAleatorias(lista: any[], cantidad: number): any[] {
    return [...lista].sort(() => Math.random() - 0.5).slice(0, cantidad);
  }

  mezclarVocales(): string[] {
    return ['a', 'e', 'i', 'o', 'u'].sort(() => Math.random() - 0.5);
  }

  ocultarLetra(texto: string): string {
    return texto.replace(this.letraSeleccionada, '_');
  }

  next() {
    this.currentIndex++;

    if (this.currentIndex >= this.exercises.length) {
      this.allCompleted = true;
    }
  }
}
