"use server";

import { signOut } from "~/server/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
} 