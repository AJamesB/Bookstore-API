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
