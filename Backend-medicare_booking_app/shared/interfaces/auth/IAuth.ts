import { UserType } from "../common/enums";

export interface JwtPayload {
  userId: string;
  email: string;
  userType: UserType;
  iat: string;
  exp: string;
}

export interface VerifyTokenResponse {
  success: boolean;
  message: string;
  data: {
    userId: string | null;
    email: string | null;
    userType: string | null;
    isValid: boolean;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    token_type: string;
  } | null;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      userType: string;
      createdAt: Date;
    };
  } | null;
}

export interface VerifyTokenResponse {
  success: boolean;
  message: string;
  data: {
    userId: string | null;
    email: string | null;
    userType: string | null;
    isValid: boolean;
  };
}

export type LoginServiceResponse =
  | { success: false; message: string }
  | { access_token: string; refresh_token: string }; // object for successful login

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    token_type: string;
  } | null;
}

export type RegisterServiceResponse =
  | {
      success: true;
      user: {
        id: string;
        email: string;
        password: string;
        userType: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  | { success: false; message: string };
