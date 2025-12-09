import request from "supertest";
import app from "../../app"; // export express app (not app.listen) for testing
import { _clearStoreForTests } from "../../repositories/bookRepository";

beforeEach(() => {
  _clearStoreForTests();
});

test("POST /books creates a book", async () => {
  const payload = { id: 1, title: "T", author: "A" };
  const res = await request(app).post("/books").send(payload);
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("id", 1);
  expect(res.body).toHaveProperty("createdAt");
});

test("GET /books/:id retrieves a book", async () => {
  const payload = { id: 1, title: "T", author: "A" };
  await request(app).post("/books").send(payload);

  const res = await request(app).get("/books/1");
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("id", 1);
  expect(res.body).toHaveProperty("title", "T");
  expect(res.body).toHaveProperty("author", "A");
});

test("PATCH /books/:id updates a book", async () => {
  const payload = { id: 1, title: "Original", author: "Author" };
  await request(app).post("/books").send(payload);

  const updateData = { title: "Updated Title", price: 29.99 };
  const res = await request(app).patch("/books/1").send(updateData);
  
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("id", 1);
  expect(res.body).toHaveProperty("title", "Updated Title");
  expect(res.body).toHaveProperty("author", "Author");
  expect(res.body).toHaveProperty("price", 29.99);
});

test("PATCH /books/:id returns 404 for non-existent book", async () => {
  const updateData = { title: "Updated" };
  const res = await request(app).patch("/books/999").send(updateData);
  
  expect(res.status).toBe(404);
  expect(res.body).toHaveProperty("error");
  expect(res.body.error).toContain("not found");
});

test("PATCH /books/:id returns 400 for invalid data", async () => {
  const payload = { id: 1, title: "Book", author: "Author" };
  await request(app).post("/books").send(payload);

  const invalidData = { title: 123 }; // title should be string
  const res = await request(app).patch("/books/1").send(invalidData);
  
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("error");
});

test("DELETE /books/:id deletes a book", async () => {
  const payload = { id: 1, title: "Book to Delete", author: "Author" };
  await request(app).post("/books").send(payload);

  const res = await request(app).delete("/books/1");
  
  expect(res.status).toBe(204);
  expect(res.body).toEqual({});

  // Verify the book is actually deleted
  const getRes = await request(app).get("/books/1");
  expect(getRes.status).toBe(404);
});

test("DELETE /books/:id returns 404 for non-existent book", async () => {
  const res = await request(app).delete("/books/999");
  
  expect(res.status).toBe(404);
  expect(res.body).toHaveProperty("error");
  expect(res.body.error).toContain("not found");
});

test("DELETE /books/:id returns 400 for invalid id", async () => {
  const res = await request(app).delete("/books/invalid");
  
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("error");
  expect(res.body.error).toContain("Invalid");
});

test("GET /books returns all books when no filter is provided", async () => {
  const book1 = { id: 1, title: "Dune", author: "Frank Herbert", genre: "Sci-Fi" };
  const book2 = { id: 2, title: "1984", author: "George Orwell", genre: "Dystopian" };
  const book3 = { id: 3, title: "Foundation", author: "Isaac Asimov", genre: "Sci-Fi" };

  await request(app).post("/books").send(book1);
  await request(app).post("/books").send(book2);
  await request(app).post("/books").send(book3);

  const res = await request(app).get("/books");

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body).toHaveLength(3);
});

test("GET /books filters by genre (exact, case-insensitive)", async () => {
  const book1 = { id: 1, title: "Dune", author: "Frank Herbert", genre: "Sci-Fi" };
  const book2 = { id: 2, title: "1984", author: "George Orwell", genre: "Dystopian" };
  const book3 = { id: 3, title: "Foundation", author: "Isaac Asimov", genre: "Sci-Fi" };

  await request(app).post("/books").send(book1);
  await request(app).post("/books").send(book2);
  await request(app).post("/books").send(book3);

  const res = await request(app).get("/books?genre=sci-fi");

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body).toHaveLength(2);
  expect(res.body[0].title).toBe("Dune");
  expect(res.body[1].title).toBe("Foundation");
});

test("GET /books filters by title (partial, case-insensitive)", async () => {
  const book1 = { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald" };
  const book2 = { id: 2, title: "Great Expectations", author: "Charles Dickens" };
  const book3 = { id: 3, title: "To Kill a Mockingbird", author: "Harper Lee" };

  await request(app).post("/books").send(book1);
  await request(app).post("/books").send(book2);
  await request(app).post("/books").send(book3);

  const res = await request(app).get("/books?title=great");

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body).toHaveLength(2);
  expect(res.body.find((b: any) => b.id === 1)).toBeDefined();
  expect(res.body.find((b: any) => b.id === 2)).toBeDefined();
});

test("GET /books filters by author (partial, case-insensitive)", async () => {
  const book1 = { id: 1, title: "Dune", author: "Frank Herbert" };
  const book2 = { id: 2, title: "The Hobbit", author: "J.R.R. Tolkien" };
  const book3 = { id: 3, title: "Neuromancer", author: "William Gibson" };

  await request(app).post("/books").send(book1);
  await request(app).post("/books").send(book2);
  await request(app).post("/books").send(book3);

  const res = await request(app).get("/books?author=herbert");

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body).toHaveLength(1);
  expect(res.body[0].author).toBe("Frank Herbert");
});

test("GET /books filters by multiple criteria", async () => {
  const book1 = { id: 1, title: "Dune", author: "Frank Herbert", genre: "Sci-Fi" };
  const book2 = { id: 2, title: "Foundation", author: "Isaac Asimov", genre: "Sci-Fi" };
  const book3 = { id: 3, title: "The Gods Themselves", author: "Isaac Asimov", genre: "Sci-Fi" };

  await request(app).post("/books").send(book1);
  await request(app).post("/books").send(book2);
  await request(app).post("/books").send(book3);

  const res = await request(app).get("/books?genre=sci-fi&author=asimov");

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body).toHaveLength(2);
  expect(res.body[0].author).toBe("Isaac Asimov");
  expect(res.body[1].author).toBe("Isaac Asimov");
});

test("GET /books returns empty array when no books match filter", async () => {
  const book1 = { id: 1, title: "Dune", author: "Frank Herbert", genre: "Sci-Fi" };
  await request(app).post("/books").send(book1);

  const res = await request(app).get("/books?genre=Fantasy");

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body).toHaveLength(0);
});

test("GET /books returns empty array when there are no books", async () => {
  const res = await request(app).get("/books");

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body).toHaveLength(0);
});

test("GET /books/discounted-price calculates discount for genre", async () => {
  const book1 = { id: 1, title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", price: 100 };
  const book2 = { id: 2, title: "Foundation", author: "Isaac Asimov", genre: "Sci-Fi", price: 50 };
  const book3 = { id: 3, title: "1984", author: "George Orwell", genre: "Dystopian", price: 30 };

  await request(app).post("/books").send(book1);
  await request(app).post("/books").send(book2);
  await request(app).post("/books").send(book3);

  const res = await request(app).get("/books/discounted-price?genre=Sci-Fi&discount=20");

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("genre", "Sci-Fi");
  expect(res.body).toHaveProperty("discount_percentage", 20);
  expect(res.body).toHaveProperty("total_discounted_price", 120); // (100 + 50) * 0.8 = 120
});

test("GET /books/discounted-price returns 400 when genre is missing", async () => {
  const res = await request(app).get("/books/discounted-price?discount=20");

  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("error");
  expect(res.body.error).toContain("genre");
});

test("GET /books/discounted-price returns 400 when discount is missing", async () => {
  const res = await request(app).get("/books/discounted-price?genre=Sci-Fi");

  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("error");
  expect(res.body.error).toContain("discount");
});

test("GET /books/discounted-price returns 400 for invalid discount", async () => {
  const res = await request(app).get("/books/discounted-price?genre=Sci-Fi&discount=invalid");

  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("error");
});

test("GET /books/discounted-price returns 404 when no books found for genre", async () => {
  const book1 = { id: 1, title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", price: 100 };
  await request(app).post("/books").send(book1);

  const res = await request(app).get("/books/discounted-price?genre=Fantasy&discount=20");

  expect(res.status).toBe(404);
  expect(res.body).toHaveProperty("error");
  expect(res.body.error).toContain("No books found");
});

test("GET /books/discounted-price handles books without price", async () => {
  const book1 = { id: 1, title: "Free Book", author: "Author", genre: "Fiction" }; // no price
  const book2 = { id: 2, title: "Paid Book", author: "Author", genre: "Fiction", price: 50 };

  await request(app).post("/books").send(book1);
  await request(app).post("/books").send(book2);

  const res = await request(app).get("/books/discounted-price?genre=Fiction&discount=10");

  expect(res.status).toBe(200);
  expect(res.body.total_discounted_price).toBe(45); // 50 * 0.9 = 45
});

test("GET /books/discounted-price handles 0% discount", async () => {
  const book1 = { id: 1, title: "Book", author: "Author", genre: "Fiction", price: 100 };
  await request(app).post("/books").send(book1);

  const res = await request(app).get("/books/discounted-price?genre=Fiction&discount=0");

  expect(res.status).toBe(200);
  expect(res.body.total_discounted_price).toBe(100); // no discount
});

test("GET /books/discounted-price handles 100% discount", async () => {
  const book1 = { id: 1, title: "Book", author: "Author", genre: "Fiction", price: 100 };
  await request(app).post("/books").send(book1);

  const res = await request(app).get("/books/discounted-price?genre=Fiction&discount=100");

  expect(res.status).toBe(200);
  expect(res.body.total_discounted_price).toBe(0); // fully discounted
});
