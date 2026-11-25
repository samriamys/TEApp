import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-exam-complete',
  templateUrl: './exam-complete.component.html',
  styleUrls: ['./exam-complete.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class ExamCompleteComponent {
  @Input() score: number = 0;
  @Input() total: number = 100;
  @Input() letra: string = 'a';
}
