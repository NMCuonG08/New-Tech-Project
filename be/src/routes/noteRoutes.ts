import { Router } from "express";
import { noteController } from "../controllers/noteController";
import { verifyToken } from "../middlewares/auth.middleware";
import { validateDto } from "../middlewares/validation.middleware";
import { CreateNoteDto, UpdateNoteDto } from "../dtos/NoteDto";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// POST /api/notes - Create a new note
router.post("/", validateDto(CreateNoteDto), noteController.createNote.bind(noteController));

// GET /api/notes - Get all user's notes
router.get("/", noteController.getUserNotes.bind(noteController));

// GET /api/notes/date-range - Get notes by date range
router.get("/date-range", noteController.getNotesByDateRange.bind(noteController));

// GET /api/notes/location/:locationId - Get notes by location
router.get("/location/:locationId", noteController.getNotesByLocation.bind(noteController));

// GET /api/notes/:id - Get note by id
router.get("/:id", noteController.getNoteById.bind(noteController));

// PUT /api/notes/:id - Update a note
router.put("/:id", validateDto(UpdateNoteDto), noteController.updateNote.bind(noteController));

// DELETE /api/notes/:id - Delete a note
router.delete("/:id", noteController.deleteNote.bind(noteController));

export default router;
