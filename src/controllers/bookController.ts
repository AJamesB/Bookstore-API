import type { Request, Response } from "express";
import * as bookService from "../services/bookService";
import type { BookFilter } from "../models/bookModel";

export const createBook = async (req: Request, res: Response) => {
  try {
    const bookData = req.body;
    const newBook = await bookService.createBook(bookData);
    res.status(201).json(newBook);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // If it's a validation error, return 400 Bad Request
    if (errorMessage.includes("Invalid")) {
      res.status(400).json({ error: errorMessage });
    } else {
      // Otherwise, return 500 Internal Server Error
      res.status(500).json({ error: errorMessage });
    }
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const book = await bookService.getBookById(bookId);
    res.status(200).json(book);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // If the book is not found, return 404 Not Found
    if (errorMessage.includes("Invalid")) {
      res.status(400).json({ error: errorMessage });
    } else if (errorMessage.includes("not found")) {
      res.status(404).json({ error: errorMessage });
    } else {
      // Otherwise, return 500 Internal Server Error
      res.status(500).json({ error: errorMessage });
    }
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const updateData = req.body;
    const updatedBook = await bookService.updateBook(bookId, updateData);
    res.status(200).json(updatedBook);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("Invalid")) {
      res.status(400).json({ error: errorMessage });
    } else if (errorMessage.includes("not found")) {
      res.status(404).json({ error: errorMessage });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    await bookService.deleteBook(bookId);
    res.status(204).send();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("Invalid")) {
      res.status(400).json({ error: errorMessage });
    } else if (errorMessage.includes("not found")) {
      res.status(404).json({ error: errorMessage });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
};

export const listBooks = async (req: Request, res: Response) => {
  try {
    const genre =
      typeof req.query.genre === "string" ? req.query.genre.trim() : undefined;
    const title =
      typeof req.query.title === "string" ? req.query.title.trim() : undefined;
    const author =
      typeof req.query.author === "string"
        ? req.query.author.trim()
        : undefined;

    const filter: BookFilter = {};
    if (genre) filter.genre = genre;
    if (title) filter.title = title;
    if (author) filter.author = author;
    const books = await bookService.listBooks(filter);
    res.status(200).json(books);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("not found")) {
      res.status(404).json({ error: errorMessage });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
};

export const getDiscountedPrice = async (req: Request, res: Response) => {
  try {
    const genre = req.query.genre;
    const discountStr = req.query.discount as string;

    if (!genre || typeof genre !== "string") {
      return res.status(400).json({ error: "Invalid or missing genre" });
    }

    const discount = parseFloat(discountStr);
    if (!discountStr || isNaN(discount)) {
      return res.status(400).json({ error: "Invalid or missing discount" });
    }

    const result = await bookService.getDiscountedPrice(
      genre.trim(),
      discount,
    );

    res.status(200).json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("Invalid")) {
      res.status(400).json({ error: errorMessage });
    } else if (errorMessage.includes("found")) {
      res.status(404).json({ error: errorMessage });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
};
