import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import confetti from 'canvas-confetti';

import { LetterExercise } from '~/app/learning/learning.models';
import { WordImageDirective } from '~/app/learning/word-image.directive';
import { WordAudioService } from '~/app/learning/word-audio.service';

@Component({
  selector: 'app-generic-exercise',
  templateUrl: './generic-exercise.component.html',
  styleUrls: ['./generic-exercise.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, WordImageDirective],
})
export class GenericExerciseComponent implements OnChanges, OnDestroy {
  @Input() exercise: LetterExercise = {
    incompleteText: '',
    completeText: '',
    imageUrl: '',
    audioUrl: '',
    letterOptions: [],
  };

  @Output() success = new EventEmitter<void>();
  @Output() answered = new EventEmitter<{ word: string; selected: string; correct: string }>();
  private timer?: ReturnType<typeof setTimeout>;

  selectedLetter: string = '';
  isExerciseSolved: boolean = false;
  audioUnavailable = false;
  constructor(private media: WordAudioService, private zone: NgZone) {}

  ngOnChanges(): void {
    if (this.timer) clearTimeout(this.timer);
    this.media.stop();
    this.selectedLetter = '';
    this.isExerciseSolved = false;
    this.audioUnavailable = false;
  }

  ngOnDestroy(): void { if (this.timer) clearTimeout(this.timer); this.media.stop(); }

  selectLetter(letter: string) {
    if (this.isExerciseSolved) {
      return;
    }
    this.selectedLetter = this.selectedLetter === letter ? '' : letter;
    if (this.selectedLetter) {
      const missingIndex = this.exercise.incompleteText.indexOf('_');
      this.answered.emit({ word: this.exercise.completeText, selected: this.selectedLetter, correct: this.exercise.completeText[missingIndex] ?? '' });
    }
    if (
      this.exercise.completeText.toLowerCase() === this.filledWord.toLowerCase()
    ) {
      this.isExerciseSolved = true;
      this.playAudio();
      this.celebrate();

      this.timer = setTimeout(() => {
        confetti.reset();
        this.success.emit();
      }, 2000);
    }
  }
  celebrate() {
    confetti({
      particleCount: 200,
      spread: 200,
      origin: { y: 0.6 },
    });
  }
  get filledWord(): string {
    if (this.selectedLetter) {
      return this.exercise.incompleteText.replace('_', this.selectedLetter);
    }
    return this.exercise.incompleteText;
  }

  isSelected(letter: string): boolean {
    return this.selectedLetter === letter;
  }

  playAudio() {
    this.audioUnavailable = false;
    this.media.play(this.exercise.audioUrl, this.exercise.completeText, () => this.zone.run(() => {
      this.audioUnavailable = true;
    }));
  }
}
