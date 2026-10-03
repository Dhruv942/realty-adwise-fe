import type { Metadata } from "next";
import { LoginPage } from "@/components/LoginPage";

export const metadata: Metadata = { title: "Executive sign in" };

export default function ExecutiveLogin(props: { searchParams: Promise<{ next?: string; expired?: string }> }) {
  return <LoginPage role="EXECUTIVE" searchParams={props.searchParams} />;
}
