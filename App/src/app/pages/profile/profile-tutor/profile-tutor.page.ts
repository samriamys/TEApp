import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { User } from '~/app/services/auth/auth.service';

export type StudentCourse = {
  name: string;
  isCourseCompleted: boolean;
};

@Component({
  selector: 'app-profile-tutor',
  templateUrl: './profile-tutor.page.html',
  styleUrls: ['./profile-tutor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ProfileTutorPage {
  testData: StudentCourse[] = [];
  studentsData: StudentCourse[] = [];
  searchName: string = '';
  userCode: string = '65451086';

  @Input() profile?: User;

  constructor() {
    this.generateStudents(10);
    this.studentsData = this.testData;
  }

  filterData(name: string) {
    this.studentsData = this.testData.filter((student) =>
      student.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  generateStudents = (number: number) => {
    const names = [
      'Alice',
      'Bob',
      'Charlie',
      'David',
      'Eva',
      'Frank',
      'Grace',
      'Hannah',
      'Ivy',
      'Jack',
      'Kathy',
      'Leo',
      'Mona',
      'Nina',
      'Oscar',
      'Paul',
      'Quincy',
      'Rachel',
      'Steve',
      'Tina',
    ];

    for (let i = 0; i < number; i++) {
      const student = {
        name:
          names[i % names.length] +
          ' ' +
          (Math.random() > 0.5 ? 'Smith' : 'Johnson'), // Random last name
        isCourseCompleted: Math.random() > 0.5, // Random boolean for course completion
      };
      this.testData.push(student);
    }
  };
}
