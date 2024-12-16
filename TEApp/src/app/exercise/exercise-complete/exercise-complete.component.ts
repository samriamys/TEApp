import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-exercise-complete',
  templateUrl: './exercise-complete.component.html',
  styleUrls: ['./exercise-complete.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink]
})
export class ExerciseCompleteComponent {}

