import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiUrl } from './api-url';
import { from, Observable } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { LocalApiService } from '../local-api/local-api.service';
import { Word } from '~/app/learning/learning.models';

@Injectable({
  providedIn: 'root',
})
export class PalabraService {
  private apiUrl = apiUrl('/api/palabras');

  constructor(private http: HttpClient, private auth: AuthService, private localApi: LocalApiService) {}

  getPalabras(vocal: string, dificultad: number): Observable<Word[]> {
    if (this.auth.isLocal) return from(this.localApi.words(vocal, dificultad));
    const params = new HttpParams()
      .set('vocal', vocal)
      .set('dificultad', dificultad.toString());

    return this.http.get<Word[]>(this.apiUrl, { params });
  }
}
