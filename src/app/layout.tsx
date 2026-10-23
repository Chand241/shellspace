import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: {
    default: "ShellSpace — Virtual Operating System & Linux Bash Laboratory",
    template: "%s | ShellSpace",
  },
  description:
    "ShellSpace: A Web-Based Virtual Operating System and Linux Bash Laboratory with Automated Practical Evaluation for university Operating System and Computer Science curricula.",
  keywords: ["ShellSpace", "Linux", "Bash", "Operating Systems", "Virtual OS", "Computer Science", "Terminal", "Lab"],
  authors: [{ name: "ShellSpace" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
