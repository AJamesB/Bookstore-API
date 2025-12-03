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
