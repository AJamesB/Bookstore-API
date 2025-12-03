import express from "express";
import * as bookController from "../controllers/bookController";

const router = express.Router();

router.post("/books", bookController.createBook);

export default router;
