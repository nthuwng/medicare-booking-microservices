import express, { Express } from "express";
import {
  createSpecialtiesController,
  getSpecialtiesController,
  deleteSpecialtyController,
  updateSpecialtyController
} from "src/controllers/specialtiesController";
import {
  authenticateToken,
  authorizeAdmin,
} from "src/middleware/auth.middleware";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeAdmin,
  createSpecialtiesController
);

router.get("/", authenticateToken, getSpecialtiesController);
router.delete("/:id", authenticateToken, authorizeAdmin , deleteSpecialtyController  );
router.put("/:id", authenticateToken, authorizeAdmin , updateSpecialtyController  );

export default router;
