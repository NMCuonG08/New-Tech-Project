import { AppDataSource } from "../data-source";
import { Alert } from "../entities/Alert";

export const alertRepository = AppDataSource.getRepository(Alert);
