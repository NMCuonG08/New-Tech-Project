import express from "express";
import { AppDataSource } from "./data-source";
import { ENV } from "./config/env";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello from Express + TypeScript + TypeORM!");
});

app.use("/auth", authRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized");

    app.listen(ENV.PORT, () => {
      console.log(`Server is running at http://localhost:${ENV.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });
