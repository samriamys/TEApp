import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { GenericLessonsComponent } from '~/app/lessons/generic-lesson/generic-lesson.component';
import { LessonsCompleteComponent } from '~/app/lessons/lessons-complete/lessons-complete.component';

@Component({
  selector: 'app-a',
  templateUrl: 'a.page.html',
  styleUrls: ['a.page.scss'],
  standalone: true,
  imports: [IonicModule, GenericLessonsComponent, LessonsCompleteComponent],
})
export class aPage {
  currentIndex = 0;
  allCompleted: boolean = false;
  clickCount = 0;
  lessons = [

    {      
      completeText: 'a',
      imageUrl: 'assets/image/a.png',
      audioUrl: 'assets/audio/a.mp3',
    },
    {      
      completeText: 'ardilla',
      imageUrl: 'assets/image/ardilla.png',
      audioUrl: 'assets/audio/ardilla.mp3',
    },
    {     
      completeText: 'abeja',
      imageUrl: 'assets/image/abeja.png',
      audioUrl: 'assets/audio/abeja.mp3',
    },
    {      
      completeText: 'anillo',
      imageUrl: 'assets/image/anillo.png',
      audioUrl: 'assets/audio/anillo.mp3',
    },
    {    
      completeText: 'arbol',
      imageUrl: 'assets/image/arbol.png',
      audioUrl: 'assets/audio/arbol.mp3',
    },
    {      
      completeText: 'avion',
      imageUrl: 'assets/image/avion.png',
      audioUrl: 'assets/audio/avion.mp3',
    },
    {      
      completeText: 'faro',
      imageUrl: 'assets/image/faro.png',
      audioUrl: 'assets/audio/faro.mp3',
    },
    {     
      completeText: 'gato',
      imageUrl: 'assets/image/gato.png',
      audioUrl: 'assets/audio/gato.mp3',
    },
    {      
      completeText: 'iman',
      imageUrl: 'assets/image/iman.png',
      audioUrl: 'assets/audio/iman.mp3',
    },
    {
      completeText: 'lapiz',
      imageUrl: 'assets/image/lapiz.png',
      audioUrl: 'assets/audio/lapiz.mp3',
    },
  ];
  constructor() {}
  ionViewWillEnter(): void {
    this.currentIndex = 0;
  }

  onImageClick(): void {
    this.clickCount++;

    // Reproducir el sonido
    const audio = new Audio(this.lessons[this.currentIndex].audioUrl);
    audio.play();

    if (this.clickCount === 3) {
      this.clickCount = 0; // Reiniciar contador
      console.log('clickCount', this.clickCount);
      // Esperar 3 segundos antes de cambiar a la siguiente imagen
      setTimeout(() => {
        this.next();
      }, 2500);
    }
  }

  next(): void {
    if (this.currentIndex < this.lessons.length - 1) {
      this.currentIndex++;
    } else {
      this.allCompleted = true;
    }
  }
}


