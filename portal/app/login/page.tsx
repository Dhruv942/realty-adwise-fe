import type { Metadata } from "next";
import { LoginPage } from "@/components/LoginPage";

export const metadata: Metadata = { title: "Sign in" };

export default function Login(props: { searchParams: Promise<{ next?: string; expired?: string }> }) {
  return <LoginPage searchParams={props.searchParams} />;
}
