import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AntdRegistry } from "@ant-design/nextjs-registry";

import "./globals.css";

export const metadata: Metadata = {
  title: "내 Next.js 앱",
  description: "Create Next App으로 생성된 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="flex flex-col items-center bg-gray-100 min-h-screen justify-center">
        <div className="w-full max-w-screen-xl">
          <Header />
        </div>
        <AntdRegistry>
          <div className="p-4 w-full max-w-screen-2xl">{children}</div>
        </AntdRegistry>
        <Footer />
      </body>
    </html>
  );
}
