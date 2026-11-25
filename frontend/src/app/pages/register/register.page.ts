import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Older /register links lead back to the Figma role-selection entry point.
@Component({ selector: 'app-register', template: '', standalone: true })
export class RegisterPage implements OnInit {
  constructor(private router: Router) {}
  ngOnInit(): void { void this.router.navigate(['/login'], { replaceUrl: true }); }
}
