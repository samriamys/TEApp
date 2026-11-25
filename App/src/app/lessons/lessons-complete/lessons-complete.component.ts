import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lessons-complete',
  templateUrl: './lessons-complete.component.html',
  styleUrls: ['./lessons-complete.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule],
})
export class LessonsCompleteComponent implements OnInit {
  letra: string = 'a';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.letra = this.route.snapshot.queryParamMap.get('letra') || 'a';
  }
}
