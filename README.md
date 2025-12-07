# Bookstore API

> [!NOTE]
> This is a simplified coding exercise implementation. It is not production-ready code.

A small TypeScript + Express API implementing a multi-layered architecture:

- **Routes**
- **Controllers**
- **Services**
- **Repositories (in-memory)**
- **Models**
- **Unit tests (Jest)**

---

## Current Features

- **Create Book** endpoint (`POST /books`)
- In-memory data storage with:
  - ID uniqueness validation
  - ISO `createdAt` timestamps
- **Find Book by ID** endpoint (`GET /books/:id`)
- **Update Book by ID** endpoint (`PATCH /books/:id`)
- **Delete Book by ID** endpoint (`DELETE /books/:id`)

---

## How to Run

```bash
npm install
npm run dev
```

---

## How to Test

```bash
npm test
```

---

## Architecture Notes

- ID is **provided by the client** (per specification).
- Repository uses an **in-memory store** for this coding exercise.
- Layers follow clean architecture:
  - Route → Controller → Service → Repository → Store
- Code is structured to allow **easy migration to a real database** later.

---

## Future Work (Not Yet Implemented)

- Calculate discounted price for a genre

---

## Manual API Testing (Example)

### Create a Book
```bash
curl -i -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "title": "Dune",
    "author": "Frank Herbert",
    "genre": "Sci-fi",
    "price": 200
  }'
```

### Find a Book by ID
```bash
curl -i -X GET http://localhost:3000/books/1
```

### Update a Book by ID
```bash
curl -i -X PATCH http://localhost:3000/books/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dune (Updated Edition)",
    "price": 250
  }'
```

### Delete a Book by ID
```bash
curl -i -X DELETE http://localhost:3000/books/1
```

---
