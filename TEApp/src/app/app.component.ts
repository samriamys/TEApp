import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { pencil, searchOutline } from 'ionicons/icons';
import { TabsPage } from './tabs/tabs.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonicModule, TabsPage],
})
export class AppComponent {
  constructor() {
    addIcons({ pencil, searchOutline });
  }
}
