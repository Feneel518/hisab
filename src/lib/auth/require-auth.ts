import "server-only";
import { auth } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  if (!user?.id || !user?.email) {
    redirect("/auth/login");
  }

  if (!user.emailVerified) {
    redirect("/auth/verify");
  }

  return { id: user.id, email: user.email, name: user.name };
};
