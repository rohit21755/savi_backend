import express from "express";
import { isUserAuthenticated } from "../middlewares/user"; // Ensure correct path
import { createAddress, getAddress, updateAddress, deleteAddress } from "../controllers/addressController";

const router = express.Router();

router.post("/", isUserAuthenticated, createAddress);
router.get("/", isUserAuthenticated, getAddress);
router.put("/", isUserAuthenticated, updateAddress);
router.delete("/", isUserAuthenticated, deleteAddress);

export default router;