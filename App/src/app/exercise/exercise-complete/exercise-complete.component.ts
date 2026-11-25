import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-exercise-complete',
  templateUrl: './exercise-complete.component.html',
  styleUrls: ['./exercise-complete.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule],
})
export class ExerciseCompleteComponent implements OnInit {
  letra: string = 'a';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.letra =
      this.route.snapshot.queryParamMap.get('letra')?.toLowerCase() || 'a';
  }
}
