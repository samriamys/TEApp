import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { User } from '~/app/services/auth/auth.service';

export type Course = {
  syllable: string;
  progress: number;
  maxProgress: number;
};

@Component({
  selector: 'app-profile-student',
  templateUrl: './profile-student.page.html',
  styleUrls: ['./profile-student.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ProfileStudentPage {
  searchName: string = '';
  rawCourses: Course[] = [];
  courses: Course[] = [];
  @Input() profile?: User;
  consonants: string[] = [
    'M',
    'S',
    'T',
    'L',
    'R',
    'P',
    'N',
    'C',
    'D',
    'V',
    'F',
    'B',
    'J',
    'Ñ',
    'G',
    'H',
    'Q',
    'Y',
    'K',
    'X',
    'W',
    'Z',
  ];
  vowels: string[] = ['a', 'e', 'i', 'o', 'u'];
  compositeConsonants: string[] = [
    'tr',
    'bl',
    'br',
    'pl',
    'pr',
    'fl',
    'fr',
    'gl',
    'gr',
    'cl',
    'cr',
    'dr',
  ];

  constructor() {
    this.getAllCourses();
    this.courses = this.rawCourses;
  }

  private getCompositeWithVowel(consonant: string): string[] {
    return this.vowels.map((vowel) => `${consonant}${vowel}`);
  }

  getAllCourses() {
    const simpleSyllables = this.consonants
      .map((consonant) => this.getCompositeWithVowel(consonant))
      .flat(1);
    const compositeSyllables = this.compositeConsonants
      .map((consonant) => this.getCompositeWithVowel(consonant))
      .flat(1);
    this.rawCourses = [
      ...this.vowels,
      ...simpleSyllables,
      ...compositeSyllables,
    ].map((syllable) => ({
      syllable: syllable,
      progress: Math.trunc(Math.random() * 5),
      maxProgress: 5,
    }));
  }

  filterData(syllable: string) {
    this.courses = this.rawCourses.filter((course) =>
      course.syllable.toLowerCase().includes(syllable.toLowerCase())
    );
  }
}
