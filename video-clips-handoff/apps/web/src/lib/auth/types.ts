export type UserRole = "admin" | "user";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  username?: string;
  passwordHash?: string;
  role: UserRole;
  googleRefreshToken?: string;
  createdAt: string;
}

export interface UsersDatabase {
  users: UserRecord[];
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  createdAt: string;
  hasPassword: boolean;
  hasGoogle: boolean;
}

export interface SessionPayload {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
}
