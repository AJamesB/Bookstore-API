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
  // Add more validation as needed
}
