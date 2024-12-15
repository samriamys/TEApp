import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this._isAuthenticated.asObservable();

  login(username: string, password: string): Promise<boolean> {
    // Implement actual login logic here
    return new Promise((resolve) => {
      setTimeout(() => {
        this._isAuthenticated.next(true);
        resolve(true);
      }, 1000);
    });
  }

  logout() {
    this._isAuthenticated.next(false);
  }
}

