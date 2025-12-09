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

test("listBooks calls repo with filter and returns books", async () => {
  const fakeBooks = [
    { id: 1, title: "Book 1", author: "Author 1", genre: "Fiction", createdAt: "2025-12-03T00:00:00.000Z" },
    { id: 2, title: "Book 2", author: "Author 2", genre: "Fiction", createdAt: "2025-12-03T00:00:00.000Z" },
  ];

  (bookRepo.findByFilter as jest.Mock).mockResolvedValue(fakeBooks);

  const filter = { genre: "Fiction" };
  const result = await bookService.listBooks(filter);

  expect(bookRepo.findByFilter).toHaveBeenCalledWith(filter);
  expect(result).toEqual(fakeBooks);
  expect(result).toHaveLength(2);
});

test("listBooks calls repo with empty filter when no filter provided", async () => {
  const fakeBooks = [
    { id: 1, title: "Book 1", author: "Author 1", createdAt: "2025-12-03T00:00:00.000Z" },
  ];

  (bookRepo.findByFilter as jest.Mock).mockResolvedValue(fakeBooks);

  const result = await bookService.listBooks();

  expect(bookRepo.findByFilter).toHaveBeenCalledWith({});
  expect(result).toEqual(fakeBooks);
});

test("listBooks returns empty array when no books match", async () => {
  (bookRepo.findByFilter as jest.Mock).mockResolvedValue([]);

  const result = await bookService.listBooks({ genre: "NonExistent" });

  expect(result).toEqual([]);
  expect(result).toHaveLength(0);
});

test("getDiscountedPrice calculates correct discounted price", async () => {
  const fakeBooks = [
    { id: 1, title: "Book 1", author: "Author 1", genre: "Fiction", price: 100, createdAt: "2025-12-03T00:00:00.000Z" },
    { id: 2, title: "Book 2", author: "Author 2", genre: "Fiction", price: 50, createdAt: "2025-12-03T00:00:00.000Z" },
  ];

  (bookRepo.findByFilter as jest.Mock).mockResolvedValue(fakeBooks);

  const result = await bookService.getDiscountedPrice("Fiction", 20);

  expect(bookRepo.findByFilter).toHaveBeenCalledWith({ genre: "Fiction" });
  expect(result).toEqual({
    genre: "Fiction",
    discount_percentage: 20,
    total_discounted_price: 120, // (100 + 50) * 0.8
  });
});

test("getDiscountedPrice throws when genre is missing or invalid", async () => {
  await expect(bookService.getDiscountedPrice("", 20)).rejects.toThrow("Invalid or missing genre");
  await expect(bookService.getDiscountedPrice("   ", 20)).rejects.toThrow("Invalid or missing genre");
  await expect(bookService.getDiscountedPrice(null as any, 20)).rejects.toThrow("Invalid or missing genre");
});

test("getDiscountedPrice throws when discount percent is invalid", async () => {
  await expect(bookService.getDiscountedPrice("Fiction", -1)).rejects.toThrow("Invalid discount percent");
  await expect(bookService.getDiscountedPrice("Fiction", 101)).rejects.toThrow("Invalid discount percent");
  await expect(bookService.getDiscountedPrice("Fiction", NaN)).rejects.toThrow("Invalid discount percent");
});

test("getDiscountedPrice throws when no books found for genre", async () => {
  (bookRepo.findByFilter as jest.Mock).mockResolvedValue([]);

  await expect(bookService.getDiscountedPrice("NonExistent", 20)).rejects.toThrow("No books found for genre: NonExistent");
});

test("getDiscountedPrice handles books without price (treats as 0)", async () => {
  const fakeBooks = [
    { id: 1, title: "Free Book", author: "Author", genre: "Fiction", createdAt: "2025-12-03T00:00:00.000Z" }, // no price
    { id: 2, title: "Paid Book", author: "Author", genre: "Fiction", price: 100, createdAt: "2025-12-03T00:00:00.000Z" },
  ];

  (bookRepo.findByFilter as jest.Mock).mockResolvedValue(fakeBooks);

  const result = await bookService.getDiscountedPrice("Fiction", 10);

  expect(result.total_discounted_price).toBe(90); // (0 + 100) * 0.9
});

test("getDiscountedPrice handles 0% discount", async () => {
  const fakeBooks = [
    { id: 1, title: "Book", author: "Author", genre: "Fiction", price: 100, createdAt: "2025-12-03T00:00:00.000Z" },
  ];

  (bookRepo.findByFilter as jest.Mock).mockResolvedValue(fakeBooks);

  const result = await bookService.getDiscountedPrice("Fiction", 0);

  expect(result.total_discounted_price).toBe(100); // no discount
});

test("getDiscountedPrice handles 100% discount", async () => {
  const fakeBooks = [
    { id: 1, title: "Book", author: "Author", genre: "Fiction", price: 100, createdAt: "2025-12-03T00:00:00.000Z" },
  ];

  (bookRepo.findByFilter as jest.Mock).mockResolvedValue(fakeBooks);

  const result = await bookService.getDiscountedPrice("Fiction", 100);

  expect(result.total_discounted_price).toBe(0); // fully discounted
});

test("getDiscountedPrice trims genre whitespace", async () => {
  const fakeBooks = [
    { id: 1, title: "Book", author: "Author", genre: "Fiction", price: 100, createdAt: "2025-12-03T00:00:00.000Z" },
  ];

  (bookRepo.findByFilter as jest.Mock).mockResolvedValue(fakeBooks);

  const result = await bookService.getDiscountedPrice("  Fiction  ", 20);

  expect(bookRepo.findByFilter).toHaveBeenCalledWith({ genre: "Fiction" });
  expect(result.genre).toBe("Fiction");
});
