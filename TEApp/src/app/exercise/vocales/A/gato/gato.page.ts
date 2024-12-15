import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '~/app/explore-container/explore-container.component';
import { CommonModule } from '@angular/common'; // Importa CommonModule

@Component({
  selector: 'app-gato',
  templateUrl: './gato.page.html', // Ruta ajustada
  styleUrls: ['./gato.page.scss'], // Ruta ajustada
  standalone: true,
  imports: [IonIcon, IonButton, IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, ExploreContainerComponent]
})
export class ardillaPage {
  // Template word with a missing letter
  wordTemplate: string = 'G _ T O';
  selectedLetter: string = '';
  vowels: string[] = ['A', 'E', 'I', 'O', 'U']; // Lista de vocales


  constructor() {
    console.log('Selected letter:', this.selectedLetter);
    this.shuffleVowels(); // Ordena las vocales aleatoriamente
    
  }

  // Método para barajar las vocales de manera aleatoria
  shuffleVowels() {
    this.vowels = this.vowels
      .map(value => ({ value, sort: Math.random() })) // Asocia cada elemento con un valor aleatorio
      .sort((a, b) => a.sort - b.sort) // Ordena según el valor aleatorio
      .map(({ value }) => value); // Extrae solo los valores
    console.log('Vocales barajadas:', this.vowels); // Para verificar en la consola
  }

  // Function to select a letter and update the selected letter
  selectLetter(letter: string) {
    this.selectedLetter = this.selectedLetter === letter ? '' : letter;
  }

  // Getter to fill the word dynamically
  get filledWord(): string {
    if (this.selectedLetter) {
      return this.wordTemplate.replace('_', this.selectedLetter);
    }
    return this.wordTemplate; // Return original word if no letter is selected
  }

  // Function to check if a letter button is selected
  isSelected(letter: string): boolean {
    return this.selectedLetter === letter;
  }

  playAudio() {
    const audioElement = document.getElementById('audioElement') as HTMLAudioElement;
    if (audioElement) {
      audioElement.currentTime = 0; // Reinicia el audio
      audioElement.play().catch(error => {
        console.error('Error al reproducir el audio:', error);
      });
    } else {
      console.error('Elemento de audio no encontrado.');
    }
  }
}