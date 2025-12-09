import { addBook, findById, updateById, deleteById, findByFilter, _clearStoreForTests } from "../bookRepository";
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

test("findByFilter returns all books when filter is empty", async () => {
  const book1 = { id: 1, title: "Book 1", author: "Author 1", genre: "Fiction" };
  const book2 = { id: 2, title: "Book 2", author: "Author 2", genre: "Non-Fiction" };
  
  await addBook(book1);
  await addBook(book2);

  const result = await findByFilter({});

  expect(result).toHaveLength(2);
  expect(result[0].id).toBe(1);
  expect(result[1].id).toBe(2);
});

test("findByFilter filters by genre (exact, case-insensitive)", async () => {
  const book1 = { id: 1, title: "Dune", author: "Frank Herbert", genre: "Sci-Fi" };
  const book2 = { id: 2, title: "1984", author: "George Orwell", genre: "Dystopian" };
  const book3 = { id: 3, title: "Foundation", author: "Isaac Asimov", genre: "Sci-Fi" };
  
  await addBook(book1);
  await addBook(book2);
  await addBook(book3);

  const result = await findByFilter({ genre: "sci-fi" }); // lowercase should match

  expect(result).toHaveLength(2);
  expect(result[0].genre).toBe("Sci-Fi");
  expect(result[1].genre).toBe("Sci-Fi");
});

test("findByFilter filters by title (partial, case-insensitive)", async () => {
  const book1 = { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald" };
  const book2 = { id: 2, title: "Great Expectations", author: "Charles Dickens" };
  const book3 = { id: 3, title: "To Kill a Mockingbird", author: "Harper Lee" };
  
  await addBook(book1);
  await addBook(book2);
  await addBook(book3);

  const result = await findByFilter({ title: "great" });

  expect(result).toHaveLength(2);
  expect(result.find(b => b.id === 1)).toBeDefined();
  expect(result.find(b => b.id === 2)).toBeDefined();
});

test("findByFilter filters by author (partial, case-insensitive)", async () => {
  const book1 = { id: 1, title: "Dune", author: "Frank Herbert" };
  const book2 = { id: 2, title: "The Hobbit", author: "J.R.R. Tolkien" };
  const book3 = { id: 3, title: "Neuromancer", author: "William Gibson" };
  
  await addBook(book1);
  await addBook(book2);
  await addBook(book3);

  const result = await findByFilter({ author: "HERBERT" }); // uppercase should match

  expect(result).toHaveLength(1);
  expect(result[0].author).toBe("Frank Herbert");
});

test("findByFilter filters by multiple criteria (AND logic)", async () => {
  const book1 = { id: 1, title: "Dune", author: "Frank Herbert", genre: "Sci-Fi" };
  const book2 = { id: 2, title: "Foundation", author: "Isaac Asimov", genre: "Sci-Fi" };
  const book3 = { id: 3, title: "The Gods Themselves", author: "Isaac Asimov", genre: "Sci-Fi" };
  
  await addBook(book1);
  await addBook(book2);
  await addBook(book3);

  const result = await findByFilter({ genre: "Sci-Fi", author: "asimov" });

  expect(result).toHaveLength(2);
  expect(result[0].author).toBe("Isaac Asimov");
  expect(result[1].author).toBe("Isaac Asimov");
});

test("findByFilter returns empty array when no books match", async () => {
  const book1 = { id: 1, title: "Book 1", author: "Author 1", genre: "Fiction" };
  await addBook(book1);

  const result = await findByFilter({ genre: "Fantasy" });

  expect(result).toHaveLength(0);
});

test("findByFilter returns empty array when there are no books", async () => {
  const result = await findByFilter({});

  expect(result).toHaveLength(0);
});

test("findByFilter excludes books without the optional field being filtered", async () => {
  const book1 = { id: 1, title: "Book 1", author: "Author 1", genre: "Fiction" };
  const book2 = { id: 2, title: "Book 2", author: "Author 2" }; // no genre
  
  await addBook(book1);
  await addBook(book2);

  const result = await findByFilter({ genre: "Fiction" });

  expect(result).toHaveLength(1);
  expect(result[0].id).toBe(1);
});
