import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Infy Knowledge Base",
  description: "Configure your LLM settings",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
