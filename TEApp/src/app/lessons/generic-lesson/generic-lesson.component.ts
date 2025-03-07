import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

export type Lessons = {
  completeText: string;
  imageUrl: string;
  audioUrl: string;
};

@Component({
  selector: 'app-generic-lesson',
  templateUrl: './generic-lesson.component.html',
  styleUrls: ['./generic-lesson.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class GenericLessonsComponent {
  @Input() lessons: Lessons = {
    completeText: '',
    imageUrl: '',
    audioUrl: '',
  };

  @Input() currentIndex: number = 0; // Recibe el índice de la lección actual
  @Input() totalLessons: number = 0; // Recibe el total de lecciones para calcular el progreso
  @Input() allCompleted: boolean = false; // Recibe si todas las lecciones fueron completadas
  @Input() clickCount: number = 0; // Recibe la cantidad de clicks en la lección

  @Output() success = new EventEmitter<void>();

  isLessonsSolved: boolean = false;
  constructor() {}

  getProgress(): number {
    return (this.currentIndex + 1) / this.totalLessons; // Devuelve el porcentaje de progreso
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

