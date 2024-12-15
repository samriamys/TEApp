import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService, User } from '~/app/services/auth/auth.service';
import { ProfileStudentPage } from './profile-student/profile-student.page';
import { ProfileTutorPage } from './profile-tutor/profile-tutor.page';

@Component({
  selector: 'app-profile',
  template: `
    @if(profile?.role === 'tutor'){
    <app-profile-tutor [profile]="profile"> </app-profile-tutor>
    }@else{
    <app-profile-student [profile]="profile"> </app-profile-student>
    }
  `,
  standalone: true,
  imports: [IonicModule, ProfileStudentPage, ProfileTutorPage],
})
export class ProfilePage implements OnInit {
  profile?: User;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const profile = this.authService.profile;
    console.log(profile);
    if (!profile) {
      this.router.navigate(['login']);
      return;
    }
    this.profile = profile;
  }
}
