import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PalabraService } from 'src/app/services/palabra.service';

export type Lessons = {
  completeText: string;
  imageUrl: string;
  audioUrl: string;
};

@Component({
  selector: 'app-generic-lesson',
  templateUrl: './generic-lesson.component.html',
  styleUrls: ['./generic-lesson.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class GenericLessonsComponent implements OnInit {
  lessonsList: Lessons[] = [];
  letraSeleccionada: string = 'a';

  currentIndex: number = 0;
  clickCount: number = 0;
  totalLessons: number = 0;
  isFinished: boolean = false;

  @Output() success = new EventEmitter<void>();

  constructor(
    private palabraService: PalabraService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.letraSeleccionada = params.get('letra')?.toLowerCase() || 'a';
      this.reiniciarLeccion();
      this.cargarPalabras();
    });
  }

  reiniciarLeccion() {
    this.currentIndex = 0;
    this.clickCount = 0;
    this.totalLessons = 0;
    this.isFinished = false;
    this.lessonsList = [];
  }

  cargarPalabras() {
    forkJoin({
      dificultad1: this.palabraService.getPalabras(this.letraSeleccionada, 1),
      dificultad2: this.palabraService.getPalabras(this.letraSeleccionada, 2),
      dificultad3: this.palabraService.getPalabras(this.letraSeleccionada, 3),
    }).subscribe({
      next: (data) => {
        const palabraInicial = data.dificultad1.find(
          (p) => p.texto.toLowerCase() === this.letraSeleccionada,
        );

        if (!palabraInicial) {
          console.error(
            `No se encontró la vocal inicial "${this.letraSeleccionada}" en dificultad 1`,
          );
          return;
        }

        const dificultad1Filtrada = data.dificultad1.filter(
          (p) => p.texto.toLowerCase() !== this.letraSeleccionada,
        );

        const otraFacil = this.obtenerAleatorias(dificultad1Filtrada, 1);
        const nivel2 = this.obtenerAleatorias(data.dificultad2, 2);
        const nivel3 = this.obtenerAleatorias(data.dificultad3, 2);

        this.lessonsList = [
          palabraInicial,
          ...otraFacil,
          ...nivel2,
          ...nivel3,
        ].map((item) => ({
          completeText: item.texto,
          imageUrl: item.imagen,
          audioUrl: item.audio,
        }));

        this.totalLessons = this.lessonsList.length;
      },
      error: (error) => {
        console.error('Error cargando palabras:', error);
      },
    });
  }

  obtenerAleatorias(lista: any[], cantidad: number): any[] {
    return [...lista].sort(() => Math.random() - 0.5).slice(0, cantidad);
  }

  get currentLesson(): Lessons | null {
    return this.lessonsList[this.currentIndex] ?? null;
  }

  handleClick() {
    if (!this.currentLesson || this.isFinished) return;

    this.playAudio(this.currentLesson.audioUrl);
    this.clickCount++;

    if (this.clickCount >= 3) {
      this.clickCount = 0;

      if (this.currentIndex < this.totalLessons - 1) {
        this.currentIndex++;
      } else {
        this.terminarLeccion();
      }
    }
  }

  terminarLeccion() {
    this.isFinished = true;
    this.success.emit();

    this.router.navigate(['/lessons-complete'], {
      queryParams: { letra: this.letraSeleccionada },
    });
  }

  playAudio(audioUrl: string) {
    const audio = new Audio(audioUrl);
    audio.currentTime = 0;

    audio.play().catch((error) => {
      console.error('Error playing audio:', error);
    });
  }

  getProgress(): number {
    if (this.totalLessons === 0) return 0;
    return (this.currentIndex + 1) / this.totalLessons;
  }
}
