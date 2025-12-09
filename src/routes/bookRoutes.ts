import express from "express";
import * as bookController from "../controllers/bookController";

const router = express.Router();

router.get("/books/discounted-price", bookController.getDiscountedPrice); // Must come before /books/:id
router.get("/books", bookController.listBooks);
router.post("/books", bookController.createBook);
router.get("/books/:id", bookController.getBookById);
router.patch("/books/:id", bookController.updateBook);
router.delete("/books/:id", bookController.deleteBook);

export default router;
