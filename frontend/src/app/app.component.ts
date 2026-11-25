import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { pencil, searchOutline } from 'ionicons/icons';
import { TabsPage } from './tabs/tabs.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  standalone: true,
  imports: [IonicModule, TabsPage],
})
export class AppComponent {
  constructor(public router: Router) {
    addIcons({ pencil, searchOutline });
  }
}
