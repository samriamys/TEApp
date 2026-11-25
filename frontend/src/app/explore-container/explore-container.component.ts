import { Component, Input } from '@angular/core';
import { addIcons } from 'ionicons';  
import { heart } from 'ionicons/icons';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
  standalone: true,
})
export class ExploreContainerComponent {
name: string = ''
  constructor() {

    addIcons({ heart });
  }
}
