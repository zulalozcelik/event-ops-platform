export interface AuthenticatedUser {
  id: string;
  role: string;
  email?: string;
}

export interface RequestWithUser {
  user: AuthenticatedUser;
}

export interface RequestWithOptionalUser {
  user?: AuthenticatedUser | null;
}
