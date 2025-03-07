import { Component, OnInit } from '@angular/core';
import { IonIcon } from "@ionic/angular/standalone";
import { IonicModule } from '@ionic/angular';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-lessons-complete',
  templateUrl: './lessons-complete.component.html',
  styleUrls: ['./lessons-complete.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule]
  
})
export class LessonsCompleteComponent {
}
