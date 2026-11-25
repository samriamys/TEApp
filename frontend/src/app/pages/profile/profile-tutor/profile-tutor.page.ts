import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { User } from '~/app/services/auth/auth.service';

type Student = { name: string; email: string };

@Component({
  selector: 'app-profile-tutor',
  templateUrl: './profile-tutor.page.html',
  styleUrls: ['./profile-tutor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ProfileTutorPage implements OnInit {
  studentsData: Student[] = [];
  private students: Student[] = [];
  searchName = '';
  loadError = false;
  @Input() profile?: User;

  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http.get<Student[]>('/api/profile/students').subscribe({
      next: students => { this.students = students; this.filterData(this.searchName); },
      error: () => { this.loadError = true; },
    });
  }
  filterData(name: string): void {
    const query = name.trim().toLowerCase();
    this.studentsData = this.students.filter(student => student.name.toLowerCase().includes(query));
  }
}
