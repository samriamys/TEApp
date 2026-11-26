import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { environment } from '~/environments/environment';
import { apiUrl } from '../api-url';
import { LocalApiService, LocalProfile, LocalRole } from '~/app/local-api/local-api.service';

type JwtClaims = Record<string, unknown> & {
  exp?: number;
  name?: string;
  preferred_username?: string;
  email?: string;
  teapp_tutor_code?: string;
};

type OAuthTokens = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
};

type PendingNativeAuth = { resolve: () => void; reject: (reason: Error) => void };

export type User = {
  name: string;
  email: string;
  role: 'student' | 'tutor';
  tutorCode?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly router: Router, private readonly localApi: LocalApiService) {}

  private keycloak = new Keycloak({
    url: environment.keycloakUrl,
    realm: 'teapp',
    clientId: 'teapp-web',
  });
  available = true;
  private appProfile?: { role: 'student' | 'tutor'; tutorCode: string | null };
  profileError = '';
  private nativeAccessToken?: string;
  private nativeRefreshToken?: string;
  private nativeIdToken?: string;
  private nativeClaims?: JwtClaims;
  private refreshInProgress?: Promise<string | undefined>;
  private pendingNativeAuth?: PendingNativeAuth;
  private nativeAuthCallbackHandled = false;
  private nativeLogoutResolver?: () => void;
  private localProfile?: LocalProfile;
  private keycloakInitialized = false;

  get isLocal(): boolean { return !!this.localProfile; }
  get localSubject(): string | undefined { return this.localProfile?.subject; }

  get isNative(): boolean { return Capacitor.getPlatform() === 'android'; }

  get apiBaseUrl(): string {
    return this.isNative ? environment.nativeApiBaseUrl : environment.apiBaseUrl;
  }

  async initialize(): Promise<void> {
    try {
      const localSubject = await SecureStorage.get('teapp.localSubject');
      if (typeof localSubject === 'string') this.localProfile = await this.localApi.profile(localSubject);
    } catch (error) {
      console.error('No se pudo abrir el perfil local:', error);
    }
    if (this.isNative) {
      await App.addListener('appUrlOpen', event => this.handleNativeUrl(event.url));
      await Browser.addListener('browserFinished', () => {
        if (this.nativeLogoutResolver) this.nativeLogoutResolver();
        else if (this.pendingNativeAuth && !this.nativeAuthCallbackHandled) {
          this.nativeAuthCallbackHandled = true;
          const pending = this.pendingNativeAuth;
          this.pendingNativeAuth = undefined;
          void this.clearPendingNativeAuth();
          pending.reject(new Error('Se canceló el inicio de sesión.'));
        }
      });
      if (this.isLocal) return;
      const [refreshToken, accessToken, idToken] = await Promise.all([
        SecureStorage.get('teapp.refreshToken'),
        SecureStorage.get('teapp.accessToken'),
        SecureStorage.get('teapp.idToken'),
      ]);
      this.nativeRefreshToken = typeof refreshToken === 'string' ? refreshToken : undefined;
      this.nativeAccessToken = typeof accessToken === 'string' ? accessToken : undefined;
      this.nativeIdToken = typeof idToken === 'string' ? idToken : undefined;
      if (this.nativeAccessToken) this.nativeClaims = this.decodeToken(this.nativeAccessToken);
      if (this.nativeRefreshToken) await this.accessToken();
      const launch = await App.getLaunchUrl();
      if (launch?.url) this.handleNativeUrl(launch.url);
      return;
    }
    if (!this.isLocal && sessionStorage.getItem('teapp.onlineMode') === '1') {
      try { await this.initializeOnline(true); } catch { /* Local accounts remain available. */ }
    }
  }

  private async initializeOnline(checkSso = false): Promise<void> {
    if (this.keycloakInitialized) return;
    try {
      await this.keycloak.init({ onLoad: checkSso ? 'check-sso' : undefined, checkLoginIframe: false, pkceMethod: 'S256' });
      this.keycloakInitialized = true;
      this.available = true;
    } catch (error) {
      this.available = false;
      this.keycloak = new Keycloak({ url: environment.keycloakUrl, realm: 'teapp', clientId: 'teapp-web' });
      throw error;
    }
  }

  get isAuthenticated(): boolean { return this.isLocal || (this.isNative ? !!this.nativeRefreshToken : !!this.keycloak.authenticated); }

  get profile(): User | undefined {
    if (this.localProfile) return this.localProfile;
    const claims = this.isNative ? this.nativeClaims : this.keycloak.tokenParsed as JwtClaims | undefined;
    if (!this.isAuthenticated || !claims) return undefined;
    return {
      name: (claims['name'] || claims['preferred_username'] || '') as string,
      email: (claims['email'] || '') as string,
      // This is a self-selected profile label, not an authorization grant.
      role: this.appProfile?.role || (claims['teapp_role'] === 'tutor' ? 'tutor' : 'student'),
      tutorCode: this.appProfile?.tutorCode || claims.teapp_tutor_code,
    };
  }

  async ensureProfile(tutorCode?: string): Promise<boolean> {
    if (this.isLocal) return true;
    if (this.appProfile) return true;
    const token = await this.accessToken();
    if (!token) return false;
    this.profileError = '';
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      let response = await fetch(apiUrl('/api/profile'), { headers });
      if (response.status === 404) {
        response = await fetch(apiUrl('/api/profile'), {
          method: 'POST', headers,
          body: JSON.stringify({ tutorCode: tutorCode ?? this.nativeClaims?.teapp_tutor_code ?? this.keycloak.tokenParsed?.['teapp_tutor_code'] ?? '' }),
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

  async login(role?: 'student' | 'tutor'): Promise<void> {
    if (this.isNative) return this.nativeAuthenticate(role, false);
    sessionStorage.setItem('teapp.onlineMode', '1');
    await this.initializeOnline();
    return this.keycloak.login({ redirectUri: `${window.location.origin}/profile`, loginHint: role ? `teapp:${role}` : undefined, locale: 'es' });
  }

  async register(role?: 'student' | 'tutor'): Promise<void> {
    if (this.isNative) return this.nativeAuthenticate(role, true);
    sessionStorage.setItem('teapp.onlineMode', '1');
    await this.initializeOnline();
    return this.keycloak.register({ redirectUri: `${window.location.origin}/profile`, loginHint: role ? `teapp:${role}` : undefined, locale: 'es' });
  }

  async registerLocal(input: { name: string; email: string; password: string; role: LocalRole; tutorCode?: string }): Promise<void> {
    const profile = await this.localApi.register(input);
    await this.startLocalSession(profile);
  }

  async loginLocal(email: string, password: string, role: LocalRole): Promise<void> {
    await this.startLocalSession(await this.localApi.login(email, password, role));
  }

  private async startLocalSession(profile: LocalProfile): Promise<void> {
    if (this.isNative) await this.clearNativeTokens();
    else if (this.keycloak.authenticated) this.keycloak.clearToken();
    await SecureStorage.set('teapp.localSubject', profile.subject);
    this.localProfile = profile;
    this.appProfile = undefined;
    sessionStorage.removeItem('teapp.onlineMode');
  }

  async accessToken(): Promise<string | undefined> {
    if (this.isLocal) return undefined;
    if (this.isNative) {
      if (this.nativeAccessToken && (this.nativeClaims?.exp ?? 0) > Math.floor(Date.now() / 1000) + 30) {
        return this.nativeAccessToken;
      }
      if (!this.nativeRefreshToken) return undefined;
      if (!this.refreshInProgress) {
        this.refreshInProgress = this.refreshNativeToken().finally(() => { this.refreshInProgress = undefined; });
      }
      return this.refreshInProgress;
    }
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
    if (this.isLocal) {
      this.localProfile = undefined;
      return SecureStorage.remove('teapp.localSubject').then(() => undefined);
    }
    sessionStorage.removeItem('teapp.onlineMode');
    if (this.isNative) return this.logoutNative();
    return this.keycloak.logout({ redirectUri: `${window.location.origin}/login` });
  }

  private async nativeAuthenticate(role?: 'student' | 'tutor', registration = false): Promise<void> {
    const keycloakBase = `${environment.nativeKeycloakUrl}/realms/teapp/protocol/openid-connect`;
    const verifier = this.randomUrlSafeString(32);
    const challenge = await this.pkceChallenge(verifier);
    const state = this.randomUrlSafeString(32);
    const authorization = new URL(`${keycloakBase}/${registration ? 'registrations' : 'auth'}`);
    authorization.searchParams.set('client_id', 'teapp-web');
    authorization.searchParams.set('redirect_uri', environment.nativeRedirectUri);
    authorization.searchParams.set('response_type', 'code');
    authorization.searchParams.set('scope', 'openid profile email');
    authorization.searchParams.set('state', state);
    authorization.searchParams.set('code_challenge', challenge);
    authorization.searchParams.set('code_challenge_method', 'S256');
    authorization.searchParams.set('ui_locales', 'es');
    if (role) authorization.searchParams.set('login_hint', `teapp:${role}`);

    await SecureStorage.set('teapp.pendingState', state);
    await SecureStorage.set('teapp.pendingVerifier', verifier);
    this.nativeAuthCallbackHandled = false;
    const completed = new Promise<void>((resolve, reject) => {
      this.pendingNativeAuth = { resolve, reject };
    });
    try {
      await Browser.open({ url: authorization.toString() });
      await completed;
    } catch (error) {
      await this.clearPendingNativeAuth();
      this.pendingNativeAuth = undefined;
      throw error;
    }
  }

  private async refreshNativeToken(): Promise<string | undefined> {
    try {
      const body = new URLSearchParams({
        grant_type: 'refresh_token', client_id: 'teapp-web', refresh_token: this.nativeRefreshToken!,
      });
      const response = await fetch(`${environment.nativeKeycloakUrl}/realms/teapp/protocol/openid-connect/token`, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
      });
      if (!response.ok) throw new Error('Keycloak rejected the refresh token.');
      const result = await response.json() as OAuthTokens;
      if (!result.access_token) throw new Error('Keycloak did not return an access token.');
      await this.saveNativeTokens(result);
      return this.nativeAccessToken;
    } catch {
      await this.clearNativeTokens();
      return undefined;
    }
  }

  private async saveNativeTokens(tokens: OAuthTokens): Promise<void> {
    this.nativeAccessToken = tokens.access_token;
    this.nativeRefreshToken = tokens.refresh_token ?? this.nativeRefreshToken;
    this.nativeIdToken = tokens.id_token ?? this.nativeIdToken;
    this.nativeClaims = this.decodeToken(this.nativeAccessToken!);
    await SecureStorage.set('teapp.accessToken', this.nativeAccessToken!);
    if (this.nativeRefreshToken) await SecureStorage.set('teapp.refreshToken', this.nativeRefreshToken);
    if (this.nativeIdToken) await SecureStorage.set('teapp.idToken', this.nativeIdToken);
  }

  private async handleNativeUrl(value: string): Promise<void> {
    let callback: URL;
    try { callback = new URL(value); } catch { return; }
    if (callback.host === 'logout') {
      void Browser.close();
      await this.clearNativeTokens();
      this.nativeLogoutResolver?.();
      return;
    }
    if (callback.host !== 'oauth' || this.nativeAuthCallbackHandled) return;
    this.nativeAuthCallbackHandled = true;
    const pending = this.pendingNativeAuth;
    try {
      await Browser.close();
      const expectedState = await SecureStorage.get('teapp.pendingState');
      const verifier = await SecureStorage.get('teapp.pendingVerifier');
      const returnedState = callback.searchParams.get('state');
      const code = callback.searchParams.get('code');
      const error = callback.searchParams.get('error_description') || callback.searchParams.get('error');
      if (!expectedState || typeof verifier !== 'string' || returnedState !== expectedState) {
        throw new Error('La respuesta de inicio de sesión no pudo verificarse.');
      }
      if (!code) throw new Error(error || 'Keycloak no devolvió un código de inicio de sesión.');

      const body = new URLSearchParams({
        grant_type: 'authorization_code', client_id: 'teapp-web', code,
        redirect_uri: environment.nativeRedirectUri, code_verifier: verifier,
      });
      const response = await fetch(`${environment.nativeKeycloakUrl}/realms/teapp/protocol/openid-connect/token`, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
      });
      if (!response.ok) throw new Error('No se pudo completar el inicio de sesión con Keycloak.');
      const tokens = await response.json() as OAuthTokens;
      if (!tokens.access_token || !tokens.refresh_token || !tokens.id_token) {
        throw new Error('Keycloak no devolvió una sesión completa.');
      }
      await this.clearPendingNativeAuth();
      await this.saveNativeTokens(tokens);
      if (pending) await this.router.navigateByUrl('/profile', { replaceUrl: true });
      pending?.resolve();
    } catch (error) {
      await this.clearPendingNativeAuth();
      pending?.reject(error instanceof Error ? error : new Error('No se pudo iniciar sesión.'));
    } finally {
      this.pendingNativeAuth = undefined;
    }
  }

  private async clearPendingNativeAuth(): Promise<void> {
    await Promise.all([
      SecureStorage.remove('teapp.pendingState'),
      SecureStorage.remove('teapp.pendingVerifier'),
    ]);
  }

  private randomUrlSafeString(byteLength: number): string {
    const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private async pkceChallenge(verifier: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private async logoutNative(): Promise<void> {
    if (!this.nativeIdToken) return this.clearNativeTokens();
    const endpoint = new URL(`${environment.nativeKeycloakUrl}/realms/teapp/protocol/openid-connect/logout`);
    endpoint.searchParams.set('client_id', 'teapp-web');
    endpoint.searchParams.set('id_token_hint', this.nativeIdToken);
    endpoint.searchParams.set('post_logout_redirect_uri', 'com.teapp.app://logout');
    endpoint.searchParams.set('ui_locales', 'es');

    let resolveLogout: () => void = () => {};
    const completed = new Promise<void>(resolve => { resolveLogout = resolve; });
    const browserFinished = await Browser.addListener('browserFinished', () => this.nativeLogoutResolver?.());
    const timeout = setTimeout(() => {
      void this.clearNativeTokens().finally(() => this.nativeLogoutResolver?.());
    }, 120_000);
    this.nativeLogoutResolver = () => {
      clearTimeout(timeout);
      this.nativeLogoutResolver = undefined;
      resolveLogout();
    };
    try {
      await Browser.open({ url: endpoint.toString() });
      await completed;
    } catch {
      // The local session is still cleared when the external browser cannot open.
    } finally {
      clearTimeout(timeout);
      this.nativeLogoutResolver = undefined;
      await browserFinished.remove();
      await this.clearNativeTokens();
    }
  }

  private async clearNativeTokens(): Promise<void> {
    this.nativeAccessToken = undefined;
    this.nativeRefreshToken = undefined;
    this.nativeIdToken = undefined;
    this.nativeClaims = undefined;
    this.appProfile = undefined;
    await Promise.all([
      SecureStorage.remove('teapp.accessToken'),
      SecureStorage.remove('teapp.refreshToken'),
      SecureStorage.remove('teapp.idToken'),
    ]);
  }

  private decodeToken(token: string): JwtClaims {
    const segment = token.split('.')[1];
    const binary = atob(segment.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtClaims;
  }
}
