import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '~/app/services/auth/auth.service';
import { LocalApiService } from '~/app/local-api/local-api.service';

type VowelProgress = { letter: string; completed: boolean };

@Component({
  selector: 'app-profile-student',
  templateUrl: './profile-student.page.html',
  styleUrls: ['./profile-student.page.scss'],
  standalone: true,
  imports: [FormsModule, RouterLink],
})
export class ProfileStudentPage implements OnInit {
  @Input() profile?: User;
  readonly vowels = ['a', 'e', 'i', 'o', 'u'];
  searchName = '';
  courses: VowelProgress[] = [];
  loadingProgress = false;
  localProgressError = false;
  nextLocalLesson = '';

  constructor(public auth: AuthService, private localApi: LocalApiService) {}

  ngOnInit(): void {
    void this.refreshProgress();
  }

  get filteredCourses(): VowelProgress[] {
    const search = this.searchName.trim().toLocaleLowerCase();
    return this.courses.filter(course => `vocal ${course.letter}`.includes(search));
  }

  async refreshProgress(): Promise<void> {
    const subject = this.auth.localSubject;
    if (!subject) return;
    this.loadingProgress = true;
    this.localProgressError = false;
    try {
      const completed = new Set(await this.localApi.completedLessons(subject));
      this.courses = this.vowels.map(letter => ({ letter, completed: completed.has(letter) }));
      this.nextLocalLesson = this.vowels.find(letter => !completed.has(letter))?.toUpperCase() ?? 'Completadas';
    } catch (error) {
      console.error('No se pudo cargar el progreso local:', error);
      this.localProgressError = true;
    } finally {
      this.loadingProgress = false;
    }
  }
}
