import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

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
    this.selectedLetter = this.selectedLetter === letter ? '' : letter;
    console.log(this.filledWord);
    console.log(this.exercise.completeText);
    if (
      this.exercise.completeText.toLowerCase() === this.filledWord.toLowerCase()
    ) {
      setTimeout(() => this.success.emit(), 1000);
    }
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
