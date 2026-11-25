import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { GenericLessonsComponent } from '~/app/lessons/generic-lesson/generic-lesson.component';
import { LessonsCompleteComponent } from '~/app/lessons/lessons-complete/lessons-complete.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lessons',
  templateUrl: 'lessons.page.html',
  styleUrls: ['lessons.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    GenericLessonsComponent,
    LessonsCompleteComponent,
    RouterModule,
    CommonModule,
  ],
})
export class LessonsPage {
  vowels: string[] = ['A', 'E', 'I', 'O', 'U']; // Lista de vocales
  consonants: string[] = ['M', 'S', 'T', 'L', 'R', 'P', 'N', 'C']; // Lista de consonantes

  selectedLetter: string = ''; // Variable para almacenar la letra seleccionada
  currentSection = 'Vocales';

  selectLetter(letter: string): void {
    this.selectedLetter = letter;
  }

  onScroll(event: CustomEvent): void {
    const consonantesElement = document.getElementById('consonantes');

    if (!consonantesElement) {
      return;
    }

    const position = consonantesElement.getBoundingClientRect();

    this.currentSection = position.top <= 170 ? 'Consonantes' : 'Vocales';
  }
}
