export default function IdLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-screen-xl ">{children}</div>
    </div>
  );
}
