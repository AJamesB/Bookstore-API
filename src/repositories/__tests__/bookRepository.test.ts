import { addBook, findById, _clearStoreForTests } from "../bookRepository";
import { BookCreateDTO } from "../../models/bookModel";

beforeEach(() => {
  _clearStoreForTests();
});

test("addBook persists and returns created book", async () => {
  const payload: BookCreateDTO = {
    id: "1",
    title: "Test Book",
    author: "Me",
    genre: "Fiction",
    price: 100,
  };

  const created = await addBook(payload);

  expect(created).toMatchObject({
    id: "1",
    title: "Test Book",
    author: "Me",
  });

  const found = await findById("1");
  expect(found).not.toBeNull();
  expect(found?.id).toBe("1");
});

test("addBook throws on duplicate id", async () => {
  const payload = { id: "1", title: "A", author: "B" };
  await addBook(payload);

  await expect(addBook(payload)).rejects.toThrow("ID_EXISTS");
});

test("findById returns book for known id", async () => {
  const payload = { id: "1", title: "A", author: "B" };
  await addBook(payload);

  const result = await findById("1");
  expect(result).not.toBeNull();
  expect(result?.id).toBe("1");
});

test("findById returns null for unknown id", async () => {
  const result = await findById("999");
  expect(result).toBeNull();
});
