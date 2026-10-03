import type { Metadata } from "next";
import { LoginPage } from "@/components/LoginPage";

export const metadata: Metadata = { title: "Admin sign in" };

export default function AdminLogin(props: { searchParams: Promise<{ next?: string; expired?: string }> }) {
  return <LoginPage role="ADMIN" searchParams={props.searchParams} />;
}
