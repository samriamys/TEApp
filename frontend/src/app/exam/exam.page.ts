import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  GenericExamComponent,
  ExamExercise,
} from '~/app/exam/generic-exam/generic-exam.component';

import { ExamCompleteComponent } from './exam-complete/exam-complete.component';
import { PalabraService } from '~/app/services/palabra.service';

@Component({
  selector: 'app-exam',
  templateUrl: 'exam.page.html',
  styleUrls: ['exam.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    GenericExamComponent,
    ExamCompleteComponent,
  ],
})
export class ExamPage {
  exercises: ExamExercise[] = [];

  letraSeleccionada: string = 'a';

  isLoading = false;
  examCompleted = false;

  score = 0;
  total = 100;

  constructor(
    private palabraService: PalabraService,
    private route: ActivatedRoute,
  ) {}

  ionViewWillEnter(): void {
    this.letraSeleccionada =
      this.route.snapshot.queryParamMap.get('letra')?.toLowerCase() || 'a';

    this.resetExam();
    this.cargarExamen();
  }

  resetExam() {
    this.exercises = [];
    this.examCompleted = false;
    this.score = 0;
    this.total = 100;
  }

  cargarExamen() {
    this.isLoading = true;

    forkJoin({
      dificultad1: this.palabraService.getPalabras(this.letraSeleccionada, 1),
      dificultad2: this.palabraService.getPalabras(this.letraSeleccionada, 2),
      dificultad3: this.palabraService.getPalabras(this.letraSeleccionada, 3),
    }).subscribe({
      next: (data) => {
        // 🔥 excluir la letra sola
        const nivel1 = this.obtenerAleatorias(
          this.excluirLetraSola(data.dificultad1),
          2,
        );

        const nivel2 = this.obtenerAleatorias(
          this.excluirLetraSola(data.dificultad2),
          2,
        );

        const nivel3 = this.obtenerAleatorias(
          this.excluirLetraSola(data.dificultad3),
          1,
        );

        this.exercises = [
          ...nivel1.map((item) => this.crearPregunta(item, 1, 10)),
          ...nivel2.map((item) => this.crearPregunta(item, 2, 20)),
          ...nivel3.map((item) => this.crearPregunta(item, 3, 40)),
        ].sort(() => Math.random() - 0.5);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando examen:', error);
        this.isLoading = false;
      },
    });
  }

  excluirLetraSola(lista: any[]): any[] {
    return lista.filter(
      (item) => item.texto.toLowerCase() !== this.letraSeleccionada,
    );
  }

  crearPregunta(item: any, dificultad: number, puntos: number): ExamExercise {
    return {
      incompleteText: this.ocultarLetra(item.texto),
      completeText: item.texto,
      imageUrl: item.imagen,
      audioUrl: item.audio,
      letterOptions: this.mezclarVocales(),
      dificultad,
      puntos,
    };
  }

  obtenerAleatorias(lista: any[], cantidad: number): any[] {
    return [...lista].sort(() => Math.random() - 0.5).slice(0, cantidad);
  }

  mezclarVocales(): string[] {
    return ['a', 'e', 'i', 'o', 'u'].sort(() => Math.random() - 0.5);
  }

  ocultarLetra(texto: string): string {
    return texto.toLowerCase().replace(this.letraSeleccionada, '_');
  }

  onExamFinished(resultado: { score: number; total: number }) {
    this.examCompleted = true;
    this.score = resultado.score;
    this.total = resultado.total;
  }
}
