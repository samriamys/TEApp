import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
//import { ExploreContainerComponent } from '~/app/explore-container/explore-container.component';
import { CommonModule } from '@angular/common'; // Importa CommonModule

@Component({
    selector: 'app-a',
    templateUrl: 'a.page.html',
    styleUrls: ['a.page.scss'],
    standalone: true,
    imports: [IonButton, IonHeader, IonToolbar, IonTitle, IonContent, CommonModule]
  })

  export class aPage {
    constructor() {}
 

    playAudio() {
        const audioElement = document.getElementById('audioElement') as HTMLAudioElement;
        if (audioElement) {
          audioElement.currentTime = 0; // Reinicia el audio
          audioElement.play().catch(error => {
            console.error('Error al reproducir el audio:', error);
          });
        } else {
          console.error('Elemento de audio no encontrado.');
        }
      }
    }

