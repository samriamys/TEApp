import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

export type User = {
  name: string;
  email: string;
  role: 'student' | 'tutor';
  tutorCode?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = new Keycloak({
    url: 'http://localhost:8180',
    realm: 'teapp',
    clientId: 'teapp-web',
  });
  available = true;
  private appProfile?: { role: 'student' | 'tutor'; tutorCode: string | null };
  profileError = '';

  async initialize(): Promise<void> {
    try {
      await this.keycloak.init({ onLoad: 'check-sso', checkLoginIframe: false, pkceMethod: 'S256' });
    } catch {
      this.available = false;
    }
  }

  get isAuthenticated(): boolean { return !!this.keycloak.authenticated; }

  get profile(): User | undefined {
    if (!this.keycloak.authenticated || !this.keycloak.tokenParsed) return undefined;
    const claims = this.keycloak.tokenParsed;
    return {
      name: claims['name'] || claims['preferred_username'] || '',
      email: claims['email'] || '',
      // This is a self-selected profile label, not an authorization grant.
      role: this.appProfile?.role || (claims['teapp_role'] === 'tutor' ? 'tutor' : 'student'),
      tutorCode: this.appProfile?.tutorCode || undefined,
    };
  }

  async ensureProfile(tutorCode?: string): Promise<boolean> {
    if (this.appProfile) return true;
    const token = await this.accessToken();
    if (!token) return false;
    this.profileError = '';
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      let response = await fetch('/api/profile', { headers });
      if (response.status === 404) {
        response = await fetch('/api/profile', {
          method: 'POST', headers,
          body: JSON.stringify({ tutorCode: tutorCode ?? this.keycloak.tokenParsed?.['teapp_tutor_code'] ?? '' }),
        });
      }
      if (!response.ok) {
        this.profileError = response.status === 400 ? 'Revisa el código de tutor e inténtalo de nuevo.' : 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
        return false;
      }
      this.appProfile = await response.json();
      return true;
    } catch {
      this.profileError = 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
      return false;
    }
  }

  login(role?: 'student' | 'tutor'): Promise<void> {
    return this.keycloak.login({ redirectUri: `${window.location.origin}/profile`, loginHint: role ? `teapp:${role}` : undefined, locale: 'es' });
  }

  register(role?: 'student' | 'tutor'): Promise<void> {
    return this.keycloak.register({ redirectUri: `${window.location.origin}/profile`, loginHint: role ? `teapp:${role}` : undefined, locale: 'es' });
  }

  async accessToken(): Promise<string | undefined> {
    if (!this.keycloak.authenticated) return undefined;
    try {
      await this.keycloak.updateToken(30);
      return this.keycloak.token;
    } catch {
      this.keycloak.clearToken();
      return undefined;
    }
  }

  logout(): Promise<void> {
    this.appProfile = undefined;
    return this.keycloak.logout({ redirectUri: `${window.location.origin}/login` });
  }
}
