"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  safeEqual,
  SESSION_COOKIE,
  type Session,
} from "@/lib/auth-token";

export type LoginState = { error: string | null };

const DEMO_USER = "demo";
const DEMO_EMAIL = "demo@proyectos.com";
const DEMO_PASSWORD = "proyectyzr2026";
const SESSION_SECONDS = 60 * 60 * 8;

export async function loginAction(
  _previous: LoginState,
  formData: FormData
): Promise<LoginState> {
  const user = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const validUser = safeEqual(user, DEMO_USER) || safeEqual(user, DEMO_EMAIL);
  const validPassword = safeEqual(password, DEMO_PASSWORD);

  if (!validUser || !validPassword) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const session: Session = {
    sub: "00000000-0000-0000-0000-000000000000",
    email: DEMO_EMAIL,
    name: "Usuario Demo",
    role: "demo",
    exp: Date.now() + SESSION_SECONDS * 1000,
  };

  const token = await createSessionToken(session);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
