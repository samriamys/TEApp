import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiUrl } from './api-url';

@Injectable({
  providedIn: 'root',
})
export class PalabraService {
  private apiUrl = apiUrl('/api/palabras');

  constructor(private http: HttpClient) {}

  getPalabras(vocal: string, dificultad: number) {
    const params = new HttpParams()
      .set('vocal', vocal)
      .set('dificultad', dificultad.toString());

    return this.http.get<any[]>(this.apiUrl, { params });
  }
}
