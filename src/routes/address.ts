import express from "express";
import { isUserAuthenticated } from "../middlewares/user"; // Ensure correct path
import { createAddress, getAddress, updateAddress, deleteAddress } from "../controllers/addressController";
import { Request } from "express";
import { AuthenticatedRequest } from "../types/User";

const router = express.Router();

router.post("/", isUserAuthenticated, (req,res) => createAddress(req as AuthenticatedRequest, res));
router.get("/", isUserAuthenticated,(req,res) =>  getAddress(req as AuthenticatedRequest, res));
router.put("/", isUserAuthenticated,(req,res) =>  updateAddress(req as AuthenticatedRequest, res));
router.delete("/", isUserAuthenticated,(req,res) =>  deleteAddress(req as AuthenticatedRequest, res));

export default router;