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
