import express from "express";
const router = express();
import { create_article, delete_article, fetch_article, fetchArticleById, getMyArticles, update_article } from "../controllers/articleController.js";
import authMiddleware from "../middleware/auth.js";

router.post('/article' , authMiddleware,create_article);
router.get('/article' , authMiddleware ,fetch_article);
router.get('/article/:id' , authMiddleware,fetchArticleById);
router.get('/my-article' ,authMiddleware, getMyArticles);
router.put('/article/:id' ,authMiddleware, update_article);
router.delete('/article/:id' ,authMiddleware, delete_article)

export default router