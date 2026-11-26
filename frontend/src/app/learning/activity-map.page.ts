import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack, arrowForward, checkmarkCircle } from 'ionicons/icons';
import { CONSONANTS, VOWELS } from '~/app/learning/learning.models';
import { LocalApiService } from '~/app/local-api/local-api.service';
import { AuthService } from '~/app/services/auth/auth.service';
import type { ActivityKind } from './activity-progress.service';

type MapKind = 'lesson' | 'exercise' | 'exam';

interface LessonPage {
  id: 'vocales' | 'consonantes';
  label: string;
  letters: readonly string[];
}

@Component({
  selector: 'app-activity-map',
  templateUrl: 'activity-map.page.html',
  styleUrls: ['activity-map.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule],
})
export class ActivityMapPage implements OnInit {
  readonly kind: MapKind;
  readonly pages: LessonPage[] = [
    { id: 'vocales', label: 'Vocales', letters: VOWELS.map(letter => letter.toUpperCase()) },
    { id: 'consonantes', label: 'Consonantes', letters: CONSONANTS.slice(0, 5).map(letter => letter.toUpperCase()) },
    { id: 'consonantes', label: 'Consonantes', letters: CONSONANTS.slice(5).map(letter => letter.toUpperCase()) },
  ];
  pageIndex = 0;
  completedLetters = new Set<string>();
  nextLetter = '';

  constructor(private auth: AuthService, private localApi: LocalApiService, route: ActivatedRoute) {
    const kind = route.snapshot.data['kind'];
    this.kind = kind === 'exercise' || kind === 'exam' ? kind : 'lesson';
    addIcons({ arrowBack, arrowForward, checkmarkCircle });
  }

  ngOnInit(): void {
    void this.refreshProgress();
  }

  ionViewWillEnter(): void {
    void this.refreshProgress();
  }

  get page(): LessonPage {
    return this.pages[this.pageIndex];
  }

  get activityLabel(): string {
    return this.kind === 'exercise' ? 'Ejercicios' : this.kind === 'exam' ? 'Exámenes' : 'Lecciones';
  }

  get activityName(): string {
    return this.kind === 'exercise' ? 'Ejercicio' : this.kind === 'exam' ? 'Examen' : 'Lección';
  }

  get bannerTitle(): string {
    const letters = this.page.id === 'vocales' ? 'las vocales' : 'las consonantes';
    return `${this.kind === 'exercise' ? 'Practica' : this.kind === 'exam' ? 'Evalúa' : 'Aprende'} ${letters}`;
  }

  activityRoute(letter: string): string[] {
    const lower = letter.toLowerCase();
    if (this.kind === 'exercise') return ['/exercise', lower];
    if (this.kind === 'exam') return ['/exam', lower];
    return this.page.id === 'vocales' ? ['/lessons/Vocales', letter, lower] : ['/lessons/letras', lower];
  }

  get path(): string {
    const segments = [
      'M 25 16.67',
      ' H 75',
      ' C 108 16.67 108 50 50 50',
      ' C -8 50 -8 83.33 25 83.33',
      ' H 75',
    ];
    return segments.slice(0, this.page.letters.length).join('');
  }

  previousPage(): void {
    if (this.pageIndex > 0) this.pageIndex--;
  }

  nextPage(): void {
    if (this.pageIndex < this.pages.length - 1) this.pageIndex++;
  }

  private async refreshProgress(): Promise<void> {
    const subject = this.auth.localSubject;
    if (!subject) {
      this.completedLetters.clear();
      this.nextLetter = '';
      return;
    }
    try {
      const kind: ActivityKind = this.kind === 'exercise' ? 'exercise_completed' : this.kind === 'exam' ? 'exam_completed' : 'lesson_completed';
      this.completedLetters = new Set((await this.localApi.completedActivities(subject, kind)).map(letter => letter.toUpperCase()));
      this.nextLetter = this.pages.flatMap(page => page.letters).find(letter => !this.completedLetters.has(letter)) ?? '';
    } catch (error) {
      console.error('No se pudo cargar el progreso local:', error);
      this.completedLetters.clear();
      this.nextLetter = '';
    }
  }
}
