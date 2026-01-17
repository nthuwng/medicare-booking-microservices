import { IUserPayload } from '../shared/interfaces/auth';

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
      file?: any;
    }
  }
}

export {};
