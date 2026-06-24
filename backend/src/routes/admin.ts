import { Router } from "express";
import * as Admin from "@/controllers/admin.controller";

const router = Router();

// Public — aggregate counts displayed on the marketing homepage
router.get("/stats", Admin.getStats);

export default router;
