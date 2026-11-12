import { api } from "./api";
import type { AuthResponse } from "../stores/auth-store";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  displayName: string;
}

/** POST /auth/login. Rejects with 401 for a wrong email or password. */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", input);
  return data;
}

/** POST /auth/register. Rejects with 409 when the email is already taken. */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", input);
  return data;
}

/**
 * Where to send a user who just signed in. Someone who is only a client (has a
 * client record and runs no projects of their own) goes to the client screen;
 * everyone else goes to the workspace panel.
 */
export async function resolveHomePath(): Promise<"/client" | "/panel"> {
  try {
    await api.get("/client/me");
  } catch {
    return "/panel"; // 404: not anyone's client
  }
  try {
    const { data } = await api.get<unknown[]>("/projects");
    return data.length === 0 ? "/client" : "/panel";
  } catch {
    return "/client";
  }
}

/** POST /auth/google, with the ID token from Google's sign-in button. */
export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/google", { idToken });
  return data;
}
