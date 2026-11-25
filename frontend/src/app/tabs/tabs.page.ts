import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
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
  imports: [IonButton, IonIcon, RouterLink],
})
export class TabsPage {
  constructor() {
    addIcons({
      bookOutline,
      createOutline,
      documentTextOutline,
      personOutline,
      logOutOutline,
    });
  }
}
