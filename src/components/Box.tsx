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
      className={`rounded-lg text-white w-1/2 h-28 text-3xl flex items-center justify-center`}
      style={{ backgroundColor }}
    >
      <div style={{ backgroundColor, padding: "20px", cursor: "pointer" }}>
        <h2>{name}</h2>
      </div>
    </button>
  );
}
