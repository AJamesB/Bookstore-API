import * as bookService from "../bookService";
import * as bookRepo from "../../repositories/bookRepository";

jest.mock("../../repositories/bookRepository");

beforeEach(() => {
  jest.resetAllMocks();
});

test("createBook calls repo and returns created book", async () => {
  const payload = { id: 1, title: "T", author: "A" };
  const fakeBook = { ...payload, createdAt: "2025-12-03T00:00:00.000Z" };

  (bookRepo.addBook as jest.Mock).mockResolvedValue(fakeBook);

  const result = await bookService.createBook(payload);
  expect(bookRepo.addBook).toHaveBeenCalledWith(payload);
  expect(result).toEqual(fakeBook);
});

test("createBook throws on invalid payload", async () => {
  const badPayload = { id: "b2", title: "", author: "" };
  await expect(bookService.createBook(badPayload as any)).rejects.toThrow();
});

test("getBookById calls repo and returns book", async () => {
  const fakeBook = {
    id: 1,
    title: "T",
    author: "A",
    createdAt: "2025-12-03T00:00:00.000Z",
  };

  (bookRepo.findById as jest.Mock).mockResolvedValue(fakeBook);

  const result = await bookService.getBookById(1);
  expect(bookRepo.findById).toHaveBeenCalledWith(1);
  expect(result).toEqual(fakeBook);
});

test("getBookById throws on invalid id", async () => {
  await expect(bookService.getBookById(NaN)).rejects.toThrow("Invalid book ID");
});

test("getBookById throws when book not found", async () => {
  (bookRepo.findById as jest.Mock).mockResolvedValue(null);

  await expect(bookService.getBookById(999)).rejects.toThrow("Book with ID 999 not found");
});

test("updateBook calls repo and returns updated book", async () => {
  const existingBook = {
    id: 1,
    title: "Original",
    author: "Author",
    createdAt: "2025-12-03T00:00:00.000Z",
  };
  const updateData = { title: "Updated Title", price: 29.99 };
  const updatedBook = {
    ...existingBook,
    ...updateData,
  };

  (bookRepo.findById as jest.Mock).mockResolvedValue(existingBook);
  (bookRepo.updateById as jest.Mock).mockResolvedValue(updatedBook);

  const result = await bookService.updateBook(1, updateData);
  
  expect(bookRepo.findById).toHaveBeenCalledWith(1);
  expect(bookRepo.updateById).toHaveBeenCalledWith(1, updatedBook);
  expect(result).toEqual(updatedBook);
});

test("updateBook throws on invalid id", async () => {
  await expect(bookService.updateBook(NaN, { title: "Test" })).rejects.toThrow("Invalid book ID");
  await expect(bookService.updateBook(0, { title: "Test" })).rejects.toThrow("Invalid book ID");
  await expect(bookService.updateBook(-1, { title: "Test" })).rejects.toThrow("Invalid book ID");
});

test("updateBook throws when book not found", async () => {
  (bookRepo.findById as jest.Mock).mockResolvedValue(null);

  await expect(bookService.updateBook(999, { title: "Updated" })).rejects.toThrow("Book with ID 999 not found");
});

test("updateBook throws when no update data provided", async () => {
  const existingBook = {
    id: 1,
    title: "Original",
    author: "Author",
    createdAt: "2025-12-03T00:00:00.000Z",
  };

  (bookRepo.findById as jest.Mock).mockResolvedValue(existingBook);

  await expect(bookService.updateBook(1, {})).rejects.toThrow("No update data provided");
});

test("updateBook throws when trying to update id or createdAt", async () => {
  const existingBook = {
    id: 1,
    title: "Original",
    author: "Author",
    createdAt: "2025-12-03T00:00:00.000Z",
  };

  (bookRepo.findById as jest.Mock).mockResolvedValue(existingBook);

  await expect(bookService.updateBook(1, { id: 2 } as any)).rejects.toThrow("Cannot update id or createdAt");
  await expect(bookService.updateBook(1, { createdAt: "2025-12-07T00:00:00.000Z" } as any)).rejects.toThrow("Cannot update id or createdAt");
});

test("updateBook throws on invalid update data types", async () => {
  const existingBook = {
    id: 1,
    title: "Original",
    author: "Author",
    createdAt: "2025-12-03T00:00:00.000Z",
  };

  (bookRepo.findById as jest.Mock).mockResolvedValue(existingBook);

  await expect(bookService.updateBook(1, { title: 123 } as any)).rejects.toThrow("Invalid title");
  await expect(bookService.updateBook(1, { author: 456 } as any)).rejects.toThrow("Invalid author");
  await expect(bookService.updateBook(1, { genre: 789 } as any)).rejects.toThrow("Invalid genre");
  await expect(bookService.updateBook(1, { price: "not a number" } as any)).rejects.toThrow("Invalid price");
});

test("deleteBook calls repo to delete book", async () => {
  const existingBook = {
    id: 1,
    title: "Book to Delete",
    author: "Author",
    createdAt: "2025-12-03T00:00:00.000Z",
  };

  (bookRepo.findById as jest.Mock).mockResolvedValue(existingBook);
  (bookRepo.deleteById as jest.Mock).mockResolvedValue(true);

  await bookService.deleteBook(1);

  expect(bookRepo.findById).toHaveBeenCalledWith(1);
  expect(bookRepo.deleteById).toHaveBeenCalledWith(1);
});

test("deleteBook throws on invalid id", async () => {
  await expect(bookService.deleteBook(NaN)).rejects.toThrow("Invalid book ID");
  await expect(bookService.deleteBook(0)).rejects.toThrow("Invalid book ID");
  await expect(bookService.deleteBook(-1)).rejects.toThrow("Invalid book ID");
});

test("deleteBook throws when book not found", async () => {
  (bookRepo.findById as jest.Mock).mockResolvedValue(null);

  await expect(bookService.deleteBook(999)).rejects.toThrow("Book with ID 999 not found");
  expect(bookRepo.deleteById).not.toHaveBeenCalled();
});
