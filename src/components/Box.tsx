"use client";

import { useRouter } from "next/navigation";

interface BoxProps {
  id: string;
  name: string;
  backgroundColor: string;
}

export default function Box({ id, name, backgroundColor }: BoxProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/${id}`)}
      className={`p-4 rounded-lg shadow cursor-pointer transition-transform hover:scale-105 text-white`}
      style={{ backgroundColor }}
    >
      <div style={{ backgroundColor, padding: "20px", cursor: "pointer" }}>
        <h2>{name} 선생님</h2>
      </div>
    </button>
  );
}
