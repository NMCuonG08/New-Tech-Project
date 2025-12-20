import { User as EntityUser } from "../entities/User";

declare global {
  namespace Express {
    interface User extends EntityUser {}
    interface Request {
      user?: EntityUser;
    }
  }
}

export {};