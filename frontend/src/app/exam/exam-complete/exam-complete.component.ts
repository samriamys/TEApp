import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivityCompleteComponent } from '~/app/learning/activity-complete.component';

@Component({
  selector: 'app-exam-complete',
  templateUrl: './exam-complete.component.html',
  standalone: true,
  imports: [ActivityCompleteComponent],
})
export class ExamCompleteComponent {
  @Input() score = 0;
  @Input() total = 0;
  @Input() letra = 'a';
  @Output() retry = new EventEmitter<void>();
}
