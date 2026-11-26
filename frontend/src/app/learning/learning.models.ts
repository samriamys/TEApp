export interface Word {
  texto: string;
  imagen: string | null;
  audio: string | null;
}

export interface WordLevels {
  dificultad1: Word[];
  dificultad2: Word[];
  dificultad3: Word[];
}

export interface LetterExercise {
  incompleteText: string;
  completeText: string;
  imageUrl: string | null;
  audioUrl: string | null;
  letterOptions: string[];
}

export const VOWELS = ['a', 'e', 'i', 'o', 'u'] as const;
export const CONSONANTS = ['m', 's', 't', 'l', 'r', 'p', 'n', 'c'] as const;
