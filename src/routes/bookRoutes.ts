import express from "express";
import * as bookController from "../controllers/bookController";

const router = express.Router();

router.post("/books", bookController.createBook);
router.get("/books/:id", bookController.getBookById);
router.patch("/books/:id", bookController.updateBook);

export default router;
