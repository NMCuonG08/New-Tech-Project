import { noteRepository } from "../repositories/NoteRepository";
import { Note } from "../entities/Note";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

export class NoteService {
  async createNote(
    userId: number,
    locationId: number,
    date: string,
    title: string,
    content: string
  ): Promise<Note> {
    const note = noteRepository.create({
      userId,
      locationId,
      date,
      title,
      content
    });

    return await noteRepository.save(note);
  }

  async getUserNotes(userId: number): Promise<Note[]> {
    return await noteRepository.find({
      where: { userId },
      relations: ["location"],
      order: { date: "DESC", createdAt: "DESC" }
    });
  }

  async getNoteById(id: number, userId: number): Promise<Note | null> {
    return await noteRepository.findOne({
      where: { id, userId },
      relations: ["location"]
    });
  }

  async getNotesByLocation(userId: number, locationId: number): Promise<Note[]> {
    return await noteRepository.find({
      where: { userId, locationId },
      order: { date: "DESC", createdAt: "DESC" }
    });
  }

  async getNotesByDateRange(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<Note[]> {
    return await noteRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate)
      },
      relations: ["location"],
      order: { date: "DESC", createdAt: "DESC" }
    });
  }

  async getNoteByDate(userId: number, locationId: number, date: string): Promise<Note[]> {
    return await noteRepository.find({
      where: { userId, locationId, date },
      relations: ["location"]
    });
  }

  async updateNote(
    id: number,
    userId: number,
    updates: {
      title?: string;
      content?: string;
      date?: string;
      locationId?: number;
    }
  ): Promise<Note> {
    const note = await noteRepository.findOne({
      where: { id, userId }
    });

    if (!note) {
      throw new Error("Note not found");
    }

    Object.assign(note, updates);
    return await noteRepository.save(note);
  }

  async deleteNote(id: number, userId: number): Promise<void> {
    const note = await noteRepository.findOne({
      where: { id, userId }
    });

    if (!note) {
      throw new Error("Note not found");
    }

    await noteRepository.remove(note);
  }
}

export const noteService = new NoteService();
