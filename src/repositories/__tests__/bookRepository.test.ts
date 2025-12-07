import { addBook, findById, updateById, deleteById, _clearStoreForTests } from "../bookRepository";
import { BookCreateDTO } from "../../models/bookModel";

beforeEach(() => {
  _clearStoreForTests();
});

test("addBook persists and returns created book", async () => {
  const payload: BookCreateDTO = {
    id: 1,
    title: "Test Book",
    author: "Me",
    genre: "Fiction",
    price: 100,
  };

  const created = await addBook(payload);

  expect(created).toMatchObject({
    id: 1,
    title: "Test Book",
    author: "Me",
  });

  const found = await findById(1);
  expect(found).not.toBeNull();
  expect(found?.id).toBe(1);
});

test("addBook throws on duplicate id", async () => {
  const payload = { id: 1, title: "A", author: "B" };
  await addBook(payload);

  await expect(addBook(payload)).rejects.toThrow("ID_EXISTS");
});

test("findById returns book for known id", async () => {
  const payload = { id: 1, title: "A", author: "B" };
  await addBook(payload);

  const result = await findById(1);
  expect(result).not.toBeNull();
  expect(result?.id).toBe(1);
});

test("findById returns null for unknown id", async () => {
  const result = await findById(999);
  expect(result).toBeNull();
});

test("updateById updates and returns the book", async () => {
  const payload = { id: 1, title: "Original", author: "Author" };
  await addBook(payload);

  const updateData = { title: "Updated Title", price: 29.99 };
  const updated = await updateById(1, updateData);

  expect(updated).not.toBeNull();
  expect(updated?.id).toBe(1);
  expect(updated?.title).toBe("Updated Title");
  expect(updated?.author).toBe("Author");
  expect(updated?.price).toBe(29.99);

  // Verify the book is actually updated in the store
  const found = await findById(1);
  expect(found?.title).toBe("Updated Title");
});

test("updateById preserves createdAt", async () => {
  const payload = { id: 1, title: "Original", author: "Author" };
  const created = await addBook(payload);
  const originalCreatedAt = created.createdAt;

  const updated = await updateById(1, { title: "Updated" });

  expect(updated?.createdAt).toBe(originalCreatedAt);
});

test("updateById preserves id", async () => {
  const payload = { id: 1, title: "Original", author: "Author" };
  await addBook(payload);

  const updated = await updateById(1, { id: 999 } as any);

  expect(updated?.id).toBe(1); // ID should remain unchanged
});

test("updateById returns null for non-existent book", async () => {
  const result = await updateById(999, { title: "Updated" });
  expect(result).toBeNull();
});

test("deleteById deletes a book and returns true", async () => {
  const payload = { id: 1, title: "Book to Delete", author: "Author" };
  await addBook(payload);

  const result = await deleteById(1);

  expect(result).toBe(true);

  // Verify the book is actually deleted
  const found = await findById(1);
  expect(found).toBeNull();
});

test("deleteById returns false for non-existent book", async () => {
  const result = await deleteById(999);
  expect(result).toBe(false);
});

test("deleteById removes only the specified book", async () => {
  const book1 = { id: 1, title: "Book 1", author: "Author 1" };
  const book2 = { id: 2, title: "Book 2", author: "Author 2" };
  const book3 = { id: 3, title: "Book 3", author: "Author 3" };
  
  await addBook(book1);
  await addBook(book2);
  await addBook(book3);

  const result = await deleteById(2);

  expect(result).toBe(true);

  // Verify book 2 is deleted but others remain
  const found1 = await findById(1);
  const found2 = await findById(2);
  const found3 = await findById(3);

  expect(found1).not.toBeNull();
  expect(found2).toBeNull();
  expect(found3).not.toBeNull();
});
