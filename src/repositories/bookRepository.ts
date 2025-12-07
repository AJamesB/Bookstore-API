import type { Book, BookCreateDTO } from "../models/bookModel";

const books: Book[] = [];

/**
 * findById - return the book with the given id or null
 */
export async function findById(id: Book["id"]): Promise<Book | null> {
  const found = books.find((b) => b.id === id);
  return found ?? null;
}

/**
 * addBook - persist a new book after checking ID uniqueness
 *
 * - expects bookData to include id (service has validated shape)
 * - if id already exists, throws an Error("ID_EXISTS")
 * - sets createdAt and stores in the in-memory array
 */
export async function addBook(bookData: BookCreateDTO): Promise<Book> {
  // check for duplicate id
  const existing = await findById(bookData.id);

  if (existing) {
    throw new Error("ID_EXISTS");
  }

  // construct the Book object (copy fields, add createdAt)
  const newBook: Book = {
    ...(bookData as unknown as Book),
    createdAt: new Date().toISOString(),
  };

  // persist
  books.push(newBook);

  // return the created book
  return newBook;
}

/**
 * updateById - update the book with the given id
 *
 * - if no book with the id exists, returns null
 * - updates only the fields provided in updateData
 * - preserves createdAt and id
 */
export async function updateById(
  id: Book["id"],
  updateData: Partial<Book>,
): Promise<Book | null> {
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return null;
  }

  // Update the book while preserving the original createdAt and id
  const updatedBook = {
    ...books[index],
    ...updateData,
    id: books[index].id,
    createdAt: books[index].createdAt,
  };

  books[index] = updatedBook;
  return { ...updatedBook };
}

/**
 * deleteById - delete the book with the given id
 *
 * - returns true if a book was deleted, false if no book with the id exists
 */
export async function deleteById(id: Book["id"]): Promise<boolean> {
  const index = books.findIndex((b) => b.id === id);
  if (index === -1) {
    return false;
  }

  books.splice(index, 1);
  return true;
}

/**
 * Utility to reset store between tests
 */
export function _clearStoreForTests(): void {
  books.length = 0;
}

export async function findAll(): Promise<Book[]> {
  // return a shallow copy to avoid accidental external mutation
  return [...books];
}
