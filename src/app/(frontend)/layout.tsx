import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  description: "A boilerplate using Payload in a Next.js app.",
  title: "Payload Boilerplate",
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;
