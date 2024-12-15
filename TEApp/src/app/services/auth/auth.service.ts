import { Injectable } from '@angular/core';

export type User = {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: 'student' | 'tutor';
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _profile?: User;
  private _isAuthenticated = false;
  private authKey = 'authSessionKey';

  constructor() {
    localStorage.setItem(
      'montanoc70@tutor.com',
      JSON.stringify({
        name: 'Carlos',
        email: 'montanoc70@tutor.com',
        password: '12345',
        phoneNumber: '6621438271',
        role: 'tutor',
      })
    );
    localStorage.setItem(
      'montanoc70@gmail.com',
      JSON.stringify({
        name: 'Carlos',
        email: 'montanoc70@gmail.com',
        password: '12345',
        phoneNumber: '6621438271',
        role: 'tutor',
      })
    );
    localStorage.setItem(
      'montanoc70@student.com',
      JSON.stringify({
        name: 'Carlos',
        email: 'montanoc70@student.com',
        password: '12345',
        phoneNumber: '6621438271',
        role: 'student',
      })
    );
    const storedSessionString = localStorage.getItem(this.authKey);
    if (!storedSessionString) {
      return;
    }
    const storedSession = JSON.parse(storedSessionString);
    if (storedSession) {
      this._isAuthenticated = true;
      this._profile = storedSession;
    }
  }

  get isAuthenticated() {
    return this._isAuthenticated;
  }

  login(password: string, email: string) {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Retrieve user directly from localStorage
    const userData = localStorage.getItem(trimmedEmail);
    console.log(userData);
    if (!userData) {
      this._isAuthenticated = false;
      return false;
    }

    const user: User = JSON.parse(userData);
    if (user.password === trimmedPassword) {
      this._profile = user;
      localStorage.setItem(this.authKey, JSON.stringify(user));
      this._isAuthenticated = true;
      return true;
    }

    this._isAuthenticated = false;
    return false;
  }

  get profile() {
    return this._profile;
  }

  register(user: User) {
    const normalizedEmail = user.email.trim().toLowerCase();

    if (localStorage.getItem(normalizedEmail)) {
      alert('Email is already registered');
      return;
    }

    const normalizedUser: User = {
      ...user,
      email: normalizedEmail,
      password: user.password.trim(),
    };

    localStorage.setItem(normalizedEmail, JSON.stringify(normalizedUser));

    this._profile = normalizedUser;
    localStorage.setItem(this.authKey, JSON.stringify(normalizedUser));
    this._isAuthenticated = true;
  }

  logout() {
    this._isAuthenticated = false;
    this._profile = undefined;
    localStorage.removeItem(this.authKey);
  }
}
