import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bookOutline,
  createOutline,
  documentTextOutline,
  personOutline,
  logOutOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class TabsPage {
  constructor(private navController: NavController, private router: Router) {
    addIcons({
      bookOutline,
      createOutline,
      documentTextOutline,
      personOutline,
      logOutOutline,
    });
  }

  isActive(path: string): boolean {
    const currentPath = this.router.parseUrl(this.router.url).root.children['primary']?.segments[0]?.path;
    return currentPath === path.slice(1);
  }

  navigate(event: MouseEvent, path: string): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (this.router.url === path) return;
    void this.navController.navigateRoot(path, { animated: false });
  }
}
