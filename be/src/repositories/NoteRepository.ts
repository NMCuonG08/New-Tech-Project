import { AppDataSource } from "../data-source";
import { Note } from "../entities/Note";

export const noteRepository = AppDataSource.getRepository(Note);
