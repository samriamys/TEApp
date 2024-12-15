import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
//import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lessons',
  templateUrl: 'lessons.page.html',
  styleUrls: ['lessons.page.scss'],
  standalone: true,
  imports: [IonButton, IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, RouterLink]
})
export class LessonsPage {
  vowels: string[] = ['A', 'E', 'I', 'O', 'U']; // Lista de vocales

  constructor() {
    
  }

}
