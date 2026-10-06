import type { Metadata } from "next";
import { LoginPage } from "@/components/LoginPage";

export const metadata: Metadata = { title: "Manager sign in" };

export default function ManagerLogin(props: { searchParams: Promise<{ next?: string; expired?: string }> }) {
  return <LoginPage role="MANAGER" searchParams={props.searchParams} />;
}
