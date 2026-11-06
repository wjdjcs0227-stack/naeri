import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "심야 옥상",
  description: "달동네의 불빛과 잠시 머무는 익명의 이야기.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
