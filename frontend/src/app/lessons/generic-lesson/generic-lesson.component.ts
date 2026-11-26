import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LearningContentService, sample } from '~/app/learning/learning-content.service';
import { ActivityProgressService } from '~/app/learning/activity-progress.service';
import { LearningStatusComponent, LoadState } from '~/app/learning/learning-status.component';
import { WordImageDirective } from '~/app/learning/word-image.directive';
import { WordAudioService } from '~/app/learning/word-audio.service';

export type Lessons = {
  completeText: string;
  imageUrl: string | null;
  audioUrl: string | null;
};

@Component({
  selector: 'app-generic-lesson',
  templateUrl: './generic-lesson.component.html',
  styleUrls: ['./generic-lesson.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, LearningStatusComponent, WordImageDirective],
})
export class GenericLessonsComponent implements OnInit, OnDestroy {
  lessonsList: Lessons[] = [];
  letraSeleccionada: string = 'a';

  currentIndex: number = 0;
  clickCount: number = 0;
  isFinished: boolean = false;
  loadState: LoadState = 'loading';
  private routeSubscription?: Subscription;
  private wordsSubscription?: Subscription;
  saveError = false;
  saving = false;
  audioUnavailable = false;
  private completionId = '';
  private sessionId = '';

  constructor(
    private content: LearningContentService,
    private router: Router,
    private route: ActivatedRoute,
    private progress: ActivityProgressService,
    private media: WordAudioService,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.letraSeleccionada = params.get('letra')?.toLowerCase() || 'a';
      this.reiniciarLeccion();
      this.cargarPalabras();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.wordsSubscription?.unsubscribe();
    this.media.stop();
  }

  reiniciarLeccion() {
    this.currentIndex = 0;
    this.clickCount = 0;
    this.isFinished = false;
    this.lessonsList = [];
    this.saveError = false;
    this.saving = false;
    this.completionId = '';
    this.sessionId = '';
    this.audioUnavailable = false;
  }

  cargarPalabras() {
    this.wordsSubscription?.unsubscribe();
    this.loadState = 'loading';
    this.wordsSubscription = this.content.load(this.letraSeleccionada).subscribe({
      next: (data) => {
        const palabraInicial = data.dificultad1.find(
          (p) => p.texto.toLowerCase() === this.letraSeleccionada,
        );

        const dificultad1Filtrada = data.dificultad1.filter(
          (p) => p.texto.toLowerCase() !== this.letraSeleccionada,
        );

        const otraFacil = sample(dificultad1Filtrada, 1);
        const nivel2 = sample(data.dificultad2, 2);
        const nivel3 = sample(data.dificultad3, 2);

        this.lessonsList = [
          ...(palabraInicial ? [palabraInicial] : []),
          ...otraFacil,
          ...nivel2,
          ...nivel3,
        ].map((item) => ({
          completeText: item.texto,
          imageUrl: item.imagen,
          audioUrl: item.audio,
        }));

        this.loadState = this.lessonsList.length ? 'ready' : 'empty';
        if (this.lessonsList.length) void this.startSession();
      },
      error: (error) => {
        console.error('Error cargando palabras:', error);
        this.loadState = 'error';
      },
    });
  }

  private async startSession(): Promise<void> {
    try { this.sessionId = await this.progress.start('lesson', this.letraSeleccionada, this.lessonsList.length); }
    catch (error) { console.error('No se pudo iniciar el registro de la lección:', error); }
  }

  get currentLesson(): Lessons | null {
    return this.lessonsList[this.currentIndex] ?? null;
  }

  handleClick() {
    if (!this.currentLesson || this.isFinished) return;

    this.playAudio();
    this.clickCount++;

    if (this.clickCount >= 3) {
      this.clickCount = 0;

      if (this.currentIndex < this.lessonsList.length - 1) {
        this.currentIndex++;
        this.audioUnavailable = false;
        void this.progress.update(this.sessionId, this.currentIndex, this.lessonsList.length);
      } else {
        this.terminarLeccion();
      }
    }
  }

  async terminarLeccion() {
    if (this.saving) return;
    this.isFinished = true;
    this.saveError = false;
    this.saving = true;
    try {
      this.completionId ||= this.progress.newEventId();
      await this.progress.record('lesson_completed', this.letraSeleccionada, this.completionId);
      await this.progress.update(this.sessionId, this.lessonsList.length, this.lessonsList.length);
      await this.progress.finishSession(this.sessionId);
    } catch (error) {
      console.error('No se pudo guardar el progreso:', error);
      this.saveError = true;
      return;
    } finally {
      this.saving = false;
    }
    this.router.navigate(['/lessons-complete'], {
      queryParams: { letra: this.letraSeleccionada },
    });
  }

  playAudio(): void {
    const lesson = this.currentLesson;
    if (!lesson) return;
    const index = this.currentIndex;
    this.audioUnavailable = false;
    this.media.play(lesson.audioUrl, lesson.completeText, () => this.zone.run(() => {
      if (index === this.currentIndex) this.audioUnavailable = true;
    }));
  }

  getProgress(): number {
    if (this.lessonsList.length === 0) return 0;
    return (this.currentIndex + 1) / this.lessonsList.length;
  }
}
