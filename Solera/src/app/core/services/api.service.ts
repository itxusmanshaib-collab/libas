import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Token localStorage se nikalo
  private getToken(): string | null {
    return localStorage.getItem(environment.tokenStorageKey);
  }

  // Auth headers — JWT token ke saath
  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });
  }

  // Auth headers for file uploads — no Content-Type (let Angular set multipart/form-data)
  private authHeadersForUpload(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
  }

  // Public headers — token nahi
  private publicHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // ── Public Requests ──
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(
      `${this.baseUrl}/${endpoint}`,
      { headers: this.publicHeaders() }
    );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(
      `${this.baseUrl}/${endpoint}`,
      body,
      { headers: this.publicHeaders() }
    );
  }

  // ── Protected Requests (Token Required) ──
  getSecure<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(
      `${this.baseUrl}/${endpoint}`,
      { headers: this.authHeaders() }
    );
  }

  postSecure<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(
      `${this.baseUrl}/${endpoint}`,
      body,
      { headers: this.authHeaders() }
    );
  }

  // For file uploads (FormData) — Angular auto-sets multipart/form-data with boundary
  postSecureFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(
      `${this.baseUrl}/${endpoint}`,
      formData,
      { headers: this.authHeadersForUpload() }
    );
  }

  putSecure<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(
      `${this.baseUrl}/${endpoint}`,
      body,
      { headers: this.authHeaders() }
    );
  }

  deleteSecure<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(
      `${this.baseUrl}/${endpoint}`,
      { headers: this.authHeaders() }
    );
  }
}