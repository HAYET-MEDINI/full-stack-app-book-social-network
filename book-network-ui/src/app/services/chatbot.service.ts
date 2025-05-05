import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BookService } from './services/book.service';
import {map} from "rxjs/operators";  // Assurez-vous que ce service existe dans votre projet

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  constructor(private bookService: BookService) {}

  // Simuler une réponse à la question sur le livre
  getChatbotResponse(userMessage: string): Observable<any> {
    const normalizedMessage = userMessage.toLowerCase();

    // Réponses prédéfinies pour les questions sur un livre
    if (normalizedMessage.includes('about') || normalizedMessage.includes('what is')) {
      return this.getBookInfo();
    }

    // Réponses prédéfinies pour les questions sur un auteur
    if (normalizedMessage.includes('author') || normalizedMessage.includes('who is')) {
      return this.getAuthorInfo();
    }

    // Réponses par défaut si aucune question spécifique n'est trouvée
    return of({ answer: "Sorry, I didn't understand that. Please ask something related to a book or an author." });
  }

  // Fonction pour obtenir des informations sur le livre
  private getBookInfo(): Observable<any> {
    return this.bookService.findAllBooks({ page: 0, size: 1 }).pipe(
      // Par exemple, récupérer le premier livre pour démontrer
      map(books => {
        if (books && books.content && books.content.length > 0) {
          const book = books.content[0];
          return { answer: `The book "${book.title}" is a great read! It is about .` };
        }
        return { answer: "Sorry, I couldn't find information about the book." };
      })
    );
  }

  // Fonction pour obtenir des informations sur un auteur
  private getAuthorInfo(): Observable<any> {
    // Par exemple, si vous avez un auteur spécifique dans vos données
    return of({ answer: "The author of this book is George Orwell, known for his works like '1984' and 'Animal Farm.'" });
  }
}
