import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GenericExamComponent, ExamExercise } from '~/app/exam/generic-exam/generic-exam.component';
import { ExamCompleteComponent } from './exam-complete/exam-complete.component';
import { LearningContentService, makeLetterExercise, sample, shuffled } from '~/app/learning/learning-content.service';
import { Word } from '~/app/learning/learning.models';
import { ActivityProgressService } from '~/app/learning/activity-progress.service';
import { LearningStatusComponent, LoadState } from '~/app/learning/learning-status.component';

@Component({
  selector: 'app-exam',
  templateUrl: 'exam.page.html',
  styleUrls: ['exam.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, GenericExamComponent, ExamCompleteComponent, LearningStatusComponent],
})
export class ExamPage implements OnDestroy {
  exercises: ExamExercise[] = [];
  letraSeleccionada = 'a';
  loadState: LoadState = 'loading';
  examCompleted = false;
  saveError = false;
  saving = false;
  private completionId = '';
  private sessionId = '';
  private loading?: Subscription;
  score = 0;
  total = 0;

  constructor(private content: LearningContentService, private route: ActivatedRoute, private progress: ActivityProgressService) {}

  ionViewWillEnter(): void {
    this.letraSeleccionada = this.route.snapshot.paramMap.get('letra')?.toLowerCase() || 'a';
    this.restart();
  }

  ngOnDestroy(): void { this.loading?.unsubscribe(); }

  restart(): void {
    this.exercises = [];
    this.examCompleted = false;
    this.score = 0;
    this.total = 0;
    this.saveError = false;
    this.saving = false;
    this.completionId = '';
    this.sessionId = '';
    this.cargarExamen();
  }

  cargarExamen(): void {
    this.loading?.unsubscribe();
    this.loadState = 'loading';
    this.loading = this.content.load(this.letraSeleccionada).subscribe({
      next: data => {
        const eligible = (words: Word[]) => words.filter(word => {
          const text = word.texto.toLowerCase();
          return text !== this.letraSeleccionada && text.includes(this.letraSeleccionada);
        });
        const questions = (words: Word[], count: number, dificultad: number, puntos: number): ExamExercise[] =>
          sample(eligible(words), count).map(word => ({ ...makeLetterExercise(word, this.letraSeleccionada), dificultad, puntos }));
        this.exercises = shuffled([
          ...questions(data.dificultad1, 2, 1, 10),
          ...questions(data.dificultad2, 2, 2, 20),
          ...questions(data.dificultad3, 1, 3, 40),
        ]);
        this.loadState = this.exercises.length ? 'ready' : 'empty';
        if (this.exercises.length) void this.startSession();
      },
      error: error => { console.error('Error cargando examen:', error); this.loadState = 'error'; },
    });
  }

  private async startSession(): Promise<void> {
    try { this.sessionId = await this.progress.start('exam', this.letraSeleccionada, this.exercises.length); }
    catch (error) { console.error('No se pudo iniciar el registro del examen:', error); }
  }

  async recordAnswer(answer: { index: number; word: string; selected: string; correct: string; elapsedMs: number }): Promise<void> {
    if (!this.sessionId) return;
    try { await this.progress.answer(this.sessionId, answer.index, answer.word, answer.selected, answer.correct, answer.elapsedMs); }
    catch (error) { console.error('No se pudo guardar la respuesta:', error); }
  }

  async onExamFinished(resultado: { score: number; total: number }): Promise<void> {
    if (this.saving) return;
    this.score = resultado.score;
    this.total = resultado.total;
    this.saving = true;
    this.saveError = false;
    try {
      this.completionId ||= this.progress.newEventId();
      await this.progress.record('exam_completed', this.letraSeleccionada, this.completionId, this.score, this.total);
      await this.progress.finishSession(this.sessionId, this.score, this.total);
      this.examCompleted = true;
    } catch (error) {
      console.error('No se pudo guardar el examen:', error);
      this.saveError = true;
    } finally { this.saving = false; }
  }
}
