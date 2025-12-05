import type { BookCreateDTO, Book } from "../models/bookModel";
import * as bookRepository from "../repositories/bookRepository";

export async function createBook(bookData: BookCreateDTO): Promise<Book> {
  // Validate book data
  validateBookData(bookData);

  // Call the repository to create a new book
  const newBook = await bookRepository.addBook(bookData);
  return newBook;
}

function validateBookData(bookData: BookCreateDTO): void {
  if (!bookData.id || typeof bookData.id !== "number") {
    throw new Error("Invalid or missing id");
  }
  if (!bookData.title || typeof bookData.title !== "string") {
    throw new Error("Invalid or missing title");
  }
  if (!bookData.author || typeof bookData.author !== "string") {
    throw new Error("Invalid or missing author");
  }
}

export async function getBookById(bookId: number): Promise<Book> {
  if (isNaN(bookId) || bookId <= 0) {
    throw new Error("Invalid book ID");
  }

  const book = await bookRepository.findById(bookId);
  if (!book) {
    throw new Error(`Book with ID ${bookId} not found`);
  }
  return book;
}
