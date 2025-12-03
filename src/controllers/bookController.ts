import type { Request, Response } from "express";
import * as bookService from "../services/bookService";

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
