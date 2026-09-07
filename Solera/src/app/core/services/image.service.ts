import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private baseUrl = environment.apiUrl.replace('/api', '');

  getImageUrl(path: string | null | undefined): string {
    if (!path) return 'assets/images/no-image.png';
    if (path.startsWith('http')) return path;
    return `${this.baseUrl}/${path}`;
  }

  getUploadUrl(path: string): string {
    return `${this.baseUrl}/${path}`;
  }
}
