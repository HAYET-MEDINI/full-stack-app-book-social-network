import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HuggingFaceService {
  private apiUrl = 'http://localhost:8000/chat'; // FastAPI backend URL

  constructor(private http: HttpClient) {}

  getChatbotResponse(question: string): Observable<any> {
    return this.http.post(this.apiUrl, { question });
  }
}
