import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgZone, OnDestroy, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import confetti from 'canvas-confetti';
import { LetterExercise } from '~/app/learning/learning.models';
import { WordImageDirective } from '~/app/learning/word-image.directive';
import { WordAudioService } from '~/app/learning/word-audio.service';

export type ExamExercise = LetterExercise & {
  dificultad: number;
  puntos: number;
};

@Component({
  selector: 'app-generic-exam',
  templateUrl: './generic-exam.component.html',
  styleUrls: ['./generic-exam.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, WordImageDirective],
})
export class GenericExamComponent implements OnDestroy {
  @Input() exercises: ExamExercise[] = [];

  @Output() finished = new EventEmitter<{
    score: number;
    total: number;
  }>();
  @Output() answered = new EventEmitter<{ index: number; word: string; selected: string; correct: string; elapsedMs: number }>();
  private timer?: ReturnType<typeof setTimeout>;

  currentIndex = 0;
  selectedLetter = '';
  score = 0;

  isAnswered = false;
  isCorrect = false;
  examFinished = false;
  audioUnavailable = false;
  private questionStartedAt = Date.now();

  constructor(private media: WordAudioService, private zone: NgZone) {}

  ngOnDestroy(): void { if (this.timer) clearTimeout(this.timer); this.media.stop(); }

  get currentExercise(): ExamExercise {
    return this.exercises[this.currentIndex];
  }

  get filledWord(): string {
    if (!this.currentExercise) {
      return '';
    }

    if (this.selectedLetter) {
      return this.currentExercise.incompleteText.replace(
        '_',
        this.selectedLetter,
      );
    }

    return this.currentExercise.incompleteText;
  }

  selectLetter(letter: string) {
    if (this.isAnswered || this.examFinished) {
      return;
    }

    this.selectedLetter = letter;
    this.isAnswered = true;

    this.isCorrect =
      this.currentExercise.completeText.toLowerCase() ===
      this.filledWord.toLowerCase();

    const missingIndex = this.currentExercise.incompleteText.indexOf('_');
    this.answered.emit({
      index: this.currentIndex,
      word: this.currentExercise.completeText,
      selected: letter,
      correct: this.currentExercise.completeText[missingIndex] ?? '',
      elapsedMs: Math.max(0, Date.now() - this.questionStartedAt),
    });

    if (this.isCorrect) {
      this.score += this.currentExercise.puntos;
      this.playAudio();
      this.celebrate();
    }

    this.timer = setTimeout(() => {
      confetti.reset();
      this.nextQuestion();
    }, 1500);
  }

  nextQuestion() {
    this.media.stop();
    this.audioUnavailable = false;
    this.selectedLetter = '';
    this.isAnswered = false;
    this.isCorrect = false;

    if (this.currentIndex < this.exercises.length - 1) {
      this.currentIndex++;
      this.questionStartedAt = Date.now();
    } else {
      this.examFinished = true;

      this.finished.emit({
        score: this.score,
        total: this.exercises.reduce((sum, exercise) => sum + exercise.puntos, 0),
      });
    }
  }

  isSelected(letter: string): boolean {
    return this.selectedLetter === letter;
  }

  trackByLetter(index: number, letter: string): string {
    return letter;
  }

  playAudio() {
    if (!this.currentExercise) return;
    this.audioUnavailable = false;
    this.media.play(this.currentExercise.audioUrl, this.currentExercise.completeText, () => this.zone.run(() => {
      this.audioUnavailable = true;
    }));
  }

  celebrate() {
    confetti({
      particleCount: 200,
      spread: 200,
      origin: { y: 0.6 },
    });
  }
}
