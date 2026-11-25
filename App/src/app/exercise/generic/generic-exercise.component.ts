import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import confetti from 'canvas-confetti';

export type Exercise = {
  incompleteText: string;
  completeText: string;
  imageUrl: string;
  audioUrl: string;
  letterOptions: string[];
};

@Component({
  selector: 'app-generic-exercise',
  templateUrl: './generic-exercise.component.html',
  styleUrls: ['./generic-exercise.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class GenericExerciseComponent implements OnInit {
  @Input() exercise: Exercise = {
    incompleteText: '',
    completeText: '',
    imageUrl: '',
    audioUrl: '',
    letterOptions: [],
  };

  @Output() success = new EventEmitter<void>();

  selectedLetter: string = '';
  isExerciseSolved: boolean = false;
  constructor() {}

  ngOnInit() {
    this.shuffleLetters();
  }

  shuffleLetters() {
    this.exercise.letterOptions = this.exercise.letterOptions
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  selectLetter(letter: string) {
    if (this.isExerciseSolved) {
      return;
    }
    this.selectedLetter = this.selectedLetter === letter ? '' : letter;
    console.log(this.filledWord);
    console.log(this.exercise.completeText);
    if (
      this.exercise.completeText.toLowerCase() === this.filledWord.toLowerCase()
    ) {
      this.isExerciseSolved = true;
      this.playAudio();
      this.celebrate();

      setTimeout(() => {
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
    const audioElement = document.getElementById(
      'audioElement'
    ) as HTMLAudioElement;
    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    } else {
      console.error('Audio element not found.');
    }
  }
}
