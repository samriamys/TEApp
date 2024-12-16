import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { GenericExerciseComponent } from '~/app/exercise/generic/generic-exercise.component';
import { ExerciseCompleteComponent } from './exercise-complete/exercise-complete.component';

@Component({
  selector: 'app-exercise',
  templateUrl: 'exercise.page.html',
  styleUrls: ['exercise.page.scss'],
  standalone: true,
  imports: [IonicModule, GenericExerciseComponent, ExerciseCompleteComponent],
})
export class ExercisePage {
  currentIndex = 0;
  allCompleted: boolean = false;
  exercises = [
    {
      incompleteText: '_rdilla',
      completeText: 'ardilla',
      imageUrl: 'assets/image/ardilla.png',
      audioUrl: 'assets/audio/ardilla.mp3',
      letterOptions: ['a', 'e', 'i', 'o', 'u'],
    },
    {
      incompleteText: '_beja',
      completeText: 'abeja',
      imageUrl: 'assets/image/abeja.png',
      audioUrl: 'assets/audio/abeja.mp3',
      letterOptions: ['a', 'e', 'i', 'o', 'u'],
    },
    {
      incompleteText: '_nillo',
      completeText: 'anillo',
      imageUrl: 'assets/image/anillo.png',
      audioUrl: 'assets/audio/anillo.mp3',
      letterOptions: ['a', 'e', 'i', 'o', 'u'],
    },
    {
      incompleteText: '_rbol',
      completeText: 'arbol',
      imageUrl: 'assets/image/arbol.png',
      audioUrl: 'assets/audio/arbol.mp3',
      letterOptions: ['a', 'e', 'i', 'o', 'u'],
    },
    {
      incompleteText: '_vion',
      completeText: 'avion',
      imageUrl: 'assets/image/avion.png',
      audioUrl: 'assets/audio/avion.mp3',
      letterOptions: ['a', 'e', 'i', 'o', 'u'],
    },
    {
      incompleteText: 'f_ro',
      completeText: 'faro',
      imageUrl: 'assets/image/faro.png',
      audioUrl: 'assets/audio/faro.mp3',
      letterOptions: ['a', 'e', 'i', 'o', 'u'],
    },
    {
      incompleteText: 'g_to',
      completeText: 'gato',
      imageUrl: 'assets/image/gato.png',
      audioUrl: 'assets/audio/gato.mp3',
      letterOptions: ['a', 'e', 'i', 'o', 'u'],
    },
    {
      incompleteText: 'im_n',
      completeText: 'iman',
      imageUrl: 'assets/image/iman.png',
      audioUrl: 'assets/audio/iman.mp3',
      letterOptions: ['a', 'e', 'i', 'o', 'u'],
    },
    {
      incompleteText: 'l_piz',
      completeText: 'lapiz',
      imageUrl: 'assets/image/lapiz.png',
      audioUrl: 'assets/audio/lapiz.mp3',
      letterOptions: ['a', 'e', 'i', 'o', 'u'],
    },
  ];
  constructor() {}
  ionViewWillEnter(): void {
    this.currentIndex = 0;
  }
  next() {
    this.currentIndex = this.currentIndex + 1;
    console.log(this.currentIndex);

    if (this.currentIndex === this.exercises.length) {
      this.allCompleted = true;
    }
  }
}
