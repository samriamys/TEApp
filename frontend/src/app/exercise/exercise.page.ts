import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GenericExerciseComponent } from '~/app/exercise/generic/generic-exercise.component';
import { ExerciseCompleteComponent } from './exercise-complete/exercise-complete.component';
import { LearningContentService, makeLetterExercise, sample } from '~/app/learning/learning-content.service';
import { LetterExercise, Word } from '~/app/learning/learning.models';
import { ActivityProgressService } from '~/app/learning/activity-progress.service';
import { LearningStatusComponent, LoadState } from '~/app/learning/learning-status.component';

@Component({
  selector: 'app-exercise',
  templateUrl: 'exercise.page.html',
  styleUrls: ['exercise.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, GenericExerciseComponent, ExerciseCompleteComponent, LearningStatusComponent],
})
export class ExercisePage implements OnDestroy {
  currentIndex = 0;
  allCompleted = false;
  exercises: LetterExercise[] = [];
  loadState: LoadState = 'loading';
  saveError = false;
  saving = false;
  private completionId = '';
  private sessionId = '';
  private questionStartedAt = 0;
  private loading?: Subscription;
  letraSeleccionada = 'a';

  constructor(private content: LearningContentService, private route: ActivatedRoute, private progress: ActivityProgressService) {}

  ionViewWillEnter(): void {
    this.letraSeleccionada = this.route.snapshot.paramMap.get('letra')?.toLowerCase() || 'a';
    this.restart();
  }

  ngOnDestroy(): void { this.loading?.unsubscribe(); }

  restart(): void {
    this.currentIndex = 0;
    this.allCompleted = false;
    this.exercises = [];
    this.saveError = false;
    this.saving = false;
    this.completionId = '';
    this.sessionId = '';
    this.cargarEjercicios();
  }

  cargarEjercicios(): void {
    this.loading?.unsubscribe();
    this.loadState = 'loading';
    this.loading = this.content.load(this.letraSeleccionada).subscribe({
      next: data => {
        const eligible = (words: Word[]) => words.filter(word => word.texto.toLowerCase().includes(this.letraSeleccionada));
        this.exercises = [
          ...sample(eligible(data.dificultad1), 2),
          ...sample(eligible(data.dificultad2), 2),
          ...sample(eligible(data.dificultad3), 2),
        ].map(word => makeLetterExercise(word, this.letraSeleccionada));
        this.loadState = this.exercises.length ? 'ready' : 'empty';
        if (this.exercises.length) {
          void this.startSession();
        }
      },
      error: error => { console.error('Error cargando ejercicios:', error); this.loadState = 'error'; },
    });
  }

  private async startSession(): Promise<void> {
    try {
      this.sessionId = await this.progress.start('exercise', this.letraSeleccionada, this.exercises.length);
      this.questionStartedAt = Date.now();
    } catch (error) { console.error('No se pudo iniciar el registro del ejercicio:', error); }
  }

  async recordAnswer(answer: { word: string; selected: string; correct: string }): Promise<void> {
    if (!this.sessionId) return;
    const elapsed = Date.now() - this.questionStartedAt;
    this.questionStartedAt = Date.now();
    try { await this.progress.answer(this.sessionId, this.currentIndex, answer.word, answer.selected, answer.correct, elapsed); }
    catch (error) { console.error('No se pudo guardar la respuesta:', error); }
  }

  next(): void {
    if (this.currentIndex < this.exercises.length - 1) {
      this.currentIndex++;
      this.questionStartedAt = Date.now();
      void this.progress.update(this.sessionId, this.currentIndex, this.exercises.length);
    }
    else void this.finishExercise();
  }

  async finishExercise(): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    this.saveError = false;
    try {
      this.completionId ||= this.progress.newEventId();
      await this.progress.record('exercise_completed', this.letraSeleccionada, this.completionId);
      await this.progress.finishSession(this.sessionId);
      this.allCompleted = true;
    } catch (error) {
      console.error('No se pudo guardar el ejercicio:', error);
      this.saveError = true;
    } finally { this.saving = false; }
  }
}
