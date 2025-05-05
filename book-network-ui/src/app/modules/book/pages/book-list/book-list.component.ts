import { Component, OnInit } from '@angular/core';
import { BookService } from '../../../../services/services/book.service';
import { PageResponseBookResponse } from '../../../../services/models/page-response-book-response';
import { BookResponse } from '../../../../services/models/book-response';
import { Router } from '@angular/router';
import { HuggingFaceService } from '../../../../services/hugging-face.service';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent implements OnInit {
  suggestedQuestions: string[] = [
    'What books are available?',
    'How do I borrow a book?',
    'Can I search for books by genre?',
    'How can I reserve a book?',
    'How can I contact a librarian?',
    'Can I suggest books for the library?'
  ];
  bookResponse: PageResponseBookResponse = {};
  page = 0;
  size = 5;
  pages: any = [];
  message = '';
  level: 'success' | 'error' = 'success';
  isChatbotOpen = false;
  chatMessages: { text: string, isUser: boolean }[] = [];
  chatInput = '';
  isTyping = false;
  showSuggestedQuestions = true; // New flag to control suggested questions visibility

  // Base de données locale des questions/réponses
  localFAQ = [
    { question: 'What books are available?', answer: 'You can browse the list of books below.' },
    { question: 'How do I borrow a book?', answer: 'Just click on "Borrow" on the book card.' },
    { question: 'How can I view book details?', answer: 'Click on "Details" on the book card to see more information.' },
    { question: 'How can I search for a book?', answer: 'Use the search bar at the top of the page to find a book by title or author.' },
    { question: 'What genres of books are available?', answer: 'We have a wide selection of genres, including fiction, science fiction, fantasy, classics, and more.' },
    { question: 'Can I reserve a book?', answer: 'Yes, you can reserve a book by clicking on "Reserve" after borrowing it.' },
    { question: 'Is there a limit to how many books I can borrow?', answer: 'You can borrow up to 5 books at a time.' },
    { question: 'How can I tell if a book is available?', answer: 'Each book card shows whether it is available or borrowed.' },
    { question: 'Can I extend my borrow period?', answer: 'Yes, you can extend your borrow period directly from your user account before the due date.' },
    { question: 'What information is displayed on a book card?', answer: 'A book card displays its title, author, genre, and availability status (available or borrowed).' },
    { question: 'How can I contact a librarian?', answer: 'You can contact a librarian through the "Contact Us" option in the menu.' },
    { question: 'How do I use the chatbot?', answer: 'Click on the assistant icon in the bottom right corner of the page and ask your question.' },
    { question: 'Do you offer audiobooks?', answer: 'Currently, we only offer printed books, but we plan to add audiobooks soon.' },
    { question: 'Can I suggest books to be added to the library?', answer: 'Yes, you can suggest books through the "Suggest a Book" option in your account.' }
  ];

  constructor(
    private bookService: BookService,
    private router: Router,
    private huggingFaceService: HuggingFaceService
  ) {}

  ngOnInit(): void {
    this.findAllBooks();
    this.initializeChatbot();
  }

  private findAllBooks() {
    this.bookService.findAllBooks({
      page: this.page,
      size: this.size
    }).subscribe({
      next: (books) => {
        this.bookResponse = books;
        this.pages = Array(this.bookResponse.totalPages)
          .fill(0)
          .map((x, i) => i);
      }
    });
  }

  gotToPage(page: number) {
    this.page = page;
    this.findAllBooks();
  }

  goToFirstPage() {
    this.page = 0;
    this.findAllBooks();
  }

  goToPreviousPage() {
    this.page--;
    this.findAllBooks();
  }

  goToLastPage() {
    this.page = this.bookResponse.totalPages as number - 1;
    this.findAllBooks();
  }

  goToNextPage() {
    this.page++;
    this.findAllBooks();
  }

  get isLastPage() {
    return this.page === this.bookResponse.totalPages as number - 1;
  }

  borrowBook(book: BookResponse) {
    this.message = '';
    this.level = 'success';
    this.bookService.borrowBook({
      'book-id': book.id as number
    }).subscribe({
      next: () => {
        this.level = 'success';
        this.message = 'Book successfully added to your list';
      },
      error: (err) => {
        console.log(err);
        this.level = 'error';
        this.message = err.error.error;
      }
    });
  }

  displayBookDetails(book: BookResponse) {
    this.router.navigate(['books', 'details', book.id]);
  }

  selectSuggestedQuestion(question: string) {
    this.chatInput = question;
    this.showSuggestedQuestions = false; // Hide suggested questions after selection
    this.sendMessage(); // Automatically send the selected question
  }

  sendMessage() {
    if (this.chatInput.trim()) {
      const userMessage = this.chatInput;
      this.chatMessages.push({ text: userMessage, isUser: true });
      this.isTyping = true;
      this.showSuggestedQuestions = false; // Hide suggested questions after sending a message

      // Recherche si la question est dans la base FAQ locale
      const foundAnswer = this.localFAQ.find(faq => faq.question.toLowerCase() === userMessage.toLowerCase());

      if (foundAnswer) {
        // Réponse locale trouvée
        this.chatMessages.push({ text: foundAnswer.answer, isUser: false });
        this.isTyping = false;
      } else {
        // Pas trouvé dans la FAQ locale, interroger le chatbot externe
        this.huggingFaceService.getChatbotResponse(userMessage).subscribe({
          next: (response) => {
            const botResponse = response.answer || 'Désolé, je n’ai pas pu générer de réponse. Essayez encore !';
            this.chatMessages.push({ text: botResponse.trim(), isUser: false });
            this.isTyping = false;
          },
          error: (err) => {
            console.error('Erreur détaillée:', err);
            this.chatMessages.push({
              text: `Erreur lors de la récupération de la réponse. Détails : ${err.statusText || 'Vérifiez la console pour plus d\'infos.'} Veuillez réessayer.`,
              isUser: false
            });
            this.isTyping = false;
          }
        });
      }

      this.chatInput = '';
    }
  }

  toggleChatbot() {
    this.isChatbotOpen = !this.isChatbotOpen;
    if (this.isChatbotOpen && this.chatMessages.length === 0) {
      this.initializeChatbot();
    }
  }

  initializeChatbot() {
    this.chatMessages = [];
    this.chatMessages.push({
      text: 'Bonjour ! Je suis votre assistant IA. Posez-moi n’importe quelle question, je suis là pour aider !',
      isUser: false
    });
    this.showSuggestedQuestions = true; // Show suggested questions when chatbot is initialized
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

}
