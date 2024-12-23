import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Appbar } from "@/components/Appbar";

export const metadata: Metadata = {
  
  title: "Muzly",
  description: "A revolutionary platform for sharing and enjoying music together. Create rooms, share your favorite tracks, and let the community decide what plays next.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" >
      <body className=" bg-gray-900 min-h-screen text-white ">
        <Providers>
          <Appbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
