import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LOGIN_PATH, homePath } from "@/lib/session-cookie";

export default async function Home() {
  const session = await getSession();
  redirect(session ? homePath[session.user.role] : LOGIN_PATH);
}
