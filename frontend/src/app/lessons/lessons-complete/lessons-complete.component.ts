import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityCompleteComponent } from '~/app/learning/activity-complete.component';
import { VOWELS } from '~/app/learning/learning.models';

@Component({
  selector: 'app-lessons-complete',
  templateUrl: './lessons-complete.component.html',
  standalone: true,
  imports: [IonicModule, ActivityCompleteComponent],
})
export class LessonsCompleteComponent implements OnInit {
  letra = 'a';
  constructor(private route: ActivatedRoute, private router: Router) {}
  ngOnInit(): void { this.letra = this.route.snapshot.queryParamMap.get('letra')?.toLowerCase() || 'a'; }
  retry(): void {
    const route = (VOWELS as readonly string[]).includes(this.letra)
      ? ['/lessons/Vocales', this.letra.toUpperCase(), this.letra]
      : ['/lessons/letras', this.letra];
    void this.router.navigate(route);
  }
}
