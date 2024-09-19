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
      <body className="font-cookierun max-w-screen-xl mx-auto bg-gray-100">
        <Header />
        <AntdRegistry>
          <div className="p-10 ">{children}</div>
        </AntdRegistry>
        <Footer />
      </body>
    </html>
  );
}
