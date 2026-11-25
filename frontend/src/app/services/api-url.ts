import { Capacitor } from '@capacitor/core';
import { environment } from '~/environments/environment';

export function apiUrl(path: string): string {
  const baseUrl = Capacitor.getPlatform() === 'android'
    ? environment.nativeApiBaseUrl
    : environment.apiBaseUrl;
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
