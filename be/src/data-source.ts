import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Location } from "./entities/Location";
import { Favorite } from "./entities/Favorite";
import { Alert } from "./entities/Alert";
import { Note } from "./entities/Note";
import { ChatSession } from "./entities/ChatSession";
import { ChatMessage } from "./entities/ChatMessage";
import { SystemAlert } from "./entities/SystemAlert";
import { ENV } from "./config/env";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USERNAME,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  synchronize: true, // Chỉ nên dùng cho môi trường dev
  logging: false,
  entities: [User, Location, Favorite, Alert, Note, ChatSession, ChatMessage, SystemAlert],
  migrations: [],
  subscribers: [],
});
