import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityCompleteComponent } from '~/app/learning/activity-complete.component';

@Component({
  selector: 'app-exercise-complete',
  templateUrl: './exercise-complete.component.html',
  standalone: true,
  imports: [IonicModule, ActivityCompleteComponent],
})
export class ExerciseCompleteComponent implements OnInit {
  @Input() embedded = false;
  @Input() letter = 'a';
  @Output() retry = new EventEmitter<void>();
  constructor(private route: ActivatedRoute, private router: Router) {}
  ngOnInit(): void {
    if (!this.embedded) this.letter = this.route.snapshot.queryParamMap.get('letra')?.toLowerCase() || 'a';
  }
  repeat(): void {
    if (this.embedded) this.retry.emit();
    else void this.router.navigate(['/exercise', this.letter]);
  }
}
