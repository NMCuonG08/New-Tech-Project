import { Request, Response } from "express";
import { noteService } from "../services/noteService";

export class NoteController {
  async createNote(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { locationId, date, title, content } = req.body;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const note = await noteService.createNote(userId, locationId, date, title, content);
      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getUserNotes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const notes = await noteService.getUserNotes(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getNoteById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const note = await noteService.getNoteById(Number(id), userId);
      if (!note) {
        res.status(404).json({ message: "Note not found" });
        return;
      }

      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getNotesByLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { locationId } = req.params;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const notes = await noteService.getNotesByLocation(userId, Number(locationId));
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getNotesByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { startDate, endDate } = req.query;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      if (!startDate || !endDate) {
        res.status(400).json({ message: "startDate and endDate are required" });
        return;
      }

      const notes = await noteService.getNotesByDateRange(
        userId,
        startDate as string,
        endDate as string
      );
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateNote(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const updates = req.body;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const note = await noteService.updateNote(Number(id), userId, updates);
      res.json(note);
    } catch (error: any) {
      if (error.message === "Note not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  async deleteNote(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      await noteService.deleteNote(Number(id), userId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Note not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }
}

export const noteController = new NoteController();
