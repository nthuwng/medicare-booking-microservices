export {};

declare global {
  interface IBackendRes<T> {
    success: boolean;
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
    text?: string;
  }

  interface IBackendAiRes<T> {
    success: boolean;
    intent: string;
    model: string;
    error?: string | string[];
    data?: T;
    text?: string;
  }

  interface IModelPaginate<T> {
    meta: {
      current: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    result: T[];
  }

  interface ILogin {
    access_token: string;
    user: {
      id: string;
      email: string;
      userType: string;
      isActive: boolean;
    };
  }

  interface IRegister {
    email: string;
    password: string;
    userType: string;
  }

  interface IUser {
    id: string;
    email: string;
    userType: string;
    authProvider: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  interface IFetchAccount {
    user: IUser;
  }
}
