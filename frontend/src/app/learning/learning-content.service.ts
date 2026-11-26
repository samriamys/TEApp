import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { PalabraService } from '~/app/services/palabra.service';
import { CONSONANTS, LetterExercise, VOWELS, Word, WordLevels } from './learning.models';

/** Returns a shuffled copy without mutating the source. */
export function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const index = Math.floor(Math.random() * (i + 1));
    [result[i], result[index]] = [result[index], result[i]];
  }
  return result;
}

export function sample<T>(items: readonly T[], count: number): T[] {
  return shuffled(items).slice(0, count);
}

export function makeLetterExercise(word: Word, letter: string): LetterExercise {
  const index = word.texto.toLowerCase().indexOf(letter.toLowerCase());
  return {
    incompleteText: index < 0 ? word.texto : `${word.texto.slice(0, index)}_${word.texto.slice(index + 1)}`,
    completeText: word.texto,
    imageUrl: word.imagen,
    audioUrl: word.audio,
    letterOptions: shuffled((VOWELS as readonly string[]).includes(letter.toLowerCase()) ? VOWELS : CONSONANTS),
  };
}

@Injectable({ providedIn: 'root' })
export class LearningContentService {
  constructor(private words: PalabraService) {}

  load(letter: string): Observable<WordLevels> {
    return forkJoin({
      dificultad1: this.words.getPalabras(letter, 1),
      dificultad2: this.words.getPalabras(letter, 2),
      dificultad3: this.words.getPalabras(letter, 3),
    });
  }
}
