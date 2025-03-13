import express from "express";
import { isUserAuthenticated } from "../middlewares/user";
import { addToCart, viewCart, removeFromCart } from "../controllers/cartController";
import { AuthenticatedRequest } from "../types/User";

const router = express.Router();

router.post("/", isUserAuthenticated, async (req, res) => {
    await addToCart(req as AuthenticatedRequest, res);
});

router.get("/", isUserAuthenticated, async (req, res) => {
    await viewCart(req as AuthenticatedRequest, res);
});

router.delete("/:id", isUserAuthenticated, async (req, res) => {
    await removeFromCart(req as AuthenticatedRequest, res);
});

export default router;