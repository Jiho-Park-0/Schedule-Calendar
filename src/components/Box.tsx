"use client";

import { useRouter } from "next/navigation";

interface BoxProps {
  name: string;

  backgroundColor: string;
}

export default function Box({ name, backgroundColor }: BoxProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/${name}`)}
      className={`p-4 rounded-lg shadow cursor-pointer transition-transform hover:scale-105 text-white`}
      style={{ backgroundColor }}
    >
      <div style={{ backgroundColor, padding: "20px", cursor: "pointer" }}>
        <h2>{name}</h2>
      </div>
    </button>
  );
}
