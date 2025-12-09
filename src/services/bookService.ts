import type { BookCreateDTO, Book } from "../models/bookModel";
import * as bookRepository from "../repositories/bookRepository";
import type { BookFilter, DiscountResult } from "../models/bookModel";

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
  if (isNaN(bookId) || bookId <= 0) throw new Error("Invalid book ID");

  const book = await bookRepository.findById(bookId);
  if (!book) throw new Error(`Book with ID ${bookId} not found`);

  return book;
}

export async function updateBook(
  bookId: number,
  updateData: Partial<BookCreateDTO>,
): Promise<Book> {
  if (isNaN(bookId) || bookId <= 0) throw new Error("Invalid book ID");

  const existingBook = await bookRepository.findById(bookId);
  if (!existingBook) throw new Error(`Book with ID ${bookId} not found`);

  if (!updateData || Object.keys(updateData).length === 0)
    throw new Error("No update data provided");

  if ("id" in updateData || "createdAt" in (updateData as any)) {
    throw new Error("Cannot update id or createdAt");
  }
  validateUpdateData(updateData);

  const updatedBookData: Book = {
    ...existingBook,
    ...updateData,
  };

  return await bookRepository.updateById(bookId, updatedBookData);
}

function validateUpdateData(updateData: Partial<BookCreateDTO>): void {
  if (updateData.title && typeof updateData.title !== "string")
    throw new Error("Invalid title");

  if (updateData.author && typeof updateData.author !== "string")
    throw new Error("Invalid author");

  if (updateData.genre && typeof updateData.genre !== "string")
    throw new Error("Invalid genre");

  if (updateData.price && typeof updateData.price !== "number")
    throw new Error("Invalid price");
}

export async function deleteBook(bookId: number): Promise<void> {
  if (isNaN(bookId) || bookId <= 0) throw new Error("Invalid book ID");

  const existingBook = await bookRepository.findById(bookId);
  if (!existingBook) throw new Error(`Book with ID ${bookId} not found`);

  await bookRepository.deleteById(bookId);
}

export async function listBooks(filter: BookFilter = {}): Promise<Book[]> {
  return await bookRepository.findByFilter(filter);
}

export async function getDiscountedPrice(
  genre: string,
  discountPercent: number,
): Promise<DiscountResult> {
  if (!genre || typeof genre !== "string" || genre.trim().length === 0) {
    throw new Error("Invalid or missing genre");
  }
  if (
    isNaN(discountPercent) ||
    discountPercent < 0 ||
    discountPercent > 100
  ) {
    throw new Error("Invalid discount percent");
  }

  const books = await bookRepository.findByFilter({ genre: genre.trim() });
  if (books.length === 0) {
    throw new Error(`No books found for genre: ${genre}`);
  }

  const totalPrice = books.reduce((sum, book) => {
    return sum + (book.price ?? 0);
  }, 0);

  const discountedPrice = totalPrice - totalPrice * (discountPercent / 100);

  return {
    genre: genre.trim(),
    discount_percentage: discountPercent,
    total_discounted_price: discountedPrice,
  };
}
