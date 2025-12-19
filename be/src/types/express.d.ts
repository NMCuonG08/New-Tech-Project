// Extended the Express `Request` interface to include the `user` property.

import { User } from "../entities/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};