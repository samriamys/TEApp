import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import confetti from 'canvas-confetti';

export type ExamExercise = {
  incompleteText: string;
  completeText: string;
  imageUrl: string;
  audioUrl: string;
  letterOptions: string[];
  dificultad: number;
  puntos: number;
};

@Component({
  selector: 'app-generic-exam',
  templateUrl: './generic-exam.component.html',
  styleUrls: ['./generic-exam.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class GenericExamComponent implements OnInit {
  @Input() exercises: ExamExercise[] = [];

  @Output() finished = new EventEmitter<{
    score: number;
    total: number;
  }>();

  currentIndex = 0;
  selectedLetter = '';
  score = 0;

  isAnswered = false;
  isCorrect = false;
  examFinished = false;

  ngOnInit() {
    this.shuffleCurrentLetters();
  }

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

  shuffleCurrentLetters() {
    if (!this.currentExercise) return;

    this.currentExercise.letterOptions = this.currentExercise.letterOptions
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
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

    if (this.isCorrect) {
      this.score += this.currentExercise.puntos;
      this.playAudio();
      this.celebrate();
    }

    setTimeout(() => {
      confetti.reset();
      this.nextQuestion();
    }, 1500);
  }

  nextQuestion() {
    this.selectedLetter = '';
    this.isAnswered = false;
    this.isCorrect = false;

    if (this.currentIndex < this.exercises.length - 1) {
      this.currentIndex++;
      this.shuffleCurrentLetters();
    } else {
      this.examFinished = true;

      this.finished.emit({
        score: this.score,
        total: 100,
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
    const audioElement = document.getElementById(
      'examAudioElement',
    ) as HTMLAudioElement;

    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  }

  celebrate() {
    confetti({
      particleCount: 200,
      spread: 200,
      origin: { y: 0.6 },
    });
  }
}
